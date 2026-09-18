import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import type { AgentAdapter, AgentId, EventType, Message, RoomEvent, Run, Target } from './core.js';

type Listener = (event: RoomEvent) => void;
type Row = Record<string, unknown>;
const iso = () => new Date().toISOString();
const schema = [
  'PRAGMA journal_mode=WAL;',
  'PRAGMA foreign_keys=ON;',
  'PRAGMA busy_timeout=5000;',
  'CREATE TABLE IF NOT EXISTS rooms(room_id TEXT PRIMARY KEY, created_at TEXT NOT NULL);',
  "CREATE TABLE IF NOT EXISTS agents(room_id TEXT NOT NULL REFERENCES rooms(room_id), agent_id TEXT NOT NULL CHECK(agent_id IN ('tessa','gptina')), conversation_id TEXT, bootstrap_version TEXT NOT NULL, checkpoint_ref TEXT, context_cursor_event_id INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY(room_id,agent_id));",
  "CREATE TABLE IF NOT EXISTS messages(message_id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(room_id), client_message_id TEXT NOT NULL, author_id TEXT NOT NULL CHECK(author_id IN ('alberto','tessa','gptina')), target TEXT NOT NULL CHECK(target IN ('tessa','gptina','both')), content TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(room_id,client_message_id));",
  "CREATE TABLE IF NOT EXISTS runs(run_id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(room_id), source_message_id TEXT NOT NULL REFERENCES messages(message_id), agent_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('queued','streaming','completed','failed','cancelled')), bootstrap_version TEXT NOT NULL, checkpoint_ref TEXT, api_mode TEXT NOT NULL, model TEXT NOT NULL, context_builder_version TEXT NOT NULL, conversation_id_at_start TEXT, context_from_event_id INTEGER NOT NULL, context_through_event_id INTEGER NOT NULL, error_message TEXT, created_at TEXT NOT NULL, started_at TEXT, finished_at TEXT, UNIQUE(source_message_id,agent_id), FOREIGN KEY(room_id,agent_id) REFERENCES agents(room_id,agent_id));",
  'CREATE TABLE IF NOT EXISTS events(event_id INTEGER PRIMARY KEY AUTOINCREMENT, room_id TEXT NOT NULL REFERENCES rooms(room_id), message_id TEXT, run_id TEXT, agent_id TEXT, type TEXT NOT NULL, seq INTEGER, payload_json TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(run_id,seq), CHECK((run_id IS NULL AND seq IS NULL) OR (run_id IS NOT NULL AND seq IS NOT NULL AND seq >= 0 AND agent_id IS NOT NULL)), FOREIGN KEY(message_id) REFERENCES messages(message_id), FOREIGN KEY(run_id) REFERENCES runs(run_id));',
  'CREATE INDEX IF NOT EXISTS idx_events_room_event ON events(room_id,event_id);',
].join('\n');

export class SqliteRoomEngine {
  private db: DatabaseSync;
  private listeners = new Map<string, Set<Listener>>();

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(schema);
  }

  close() { this.db.close(); }

  private tx<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const out = fn(); this.db.exec('COMMIT'); return out; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }

  private ensureRoom(roomId: string) {
    const t = iso();
    this.db.prepare('INSERT OR IGNORE INTO rooms VALUES (?,?)').run(roomId, t);
    const q = this.db.prepare("INSERT OR IGNORE INTO agents(room_id,agent_id,conversation_id,bootstrap_version,checkpoint_ref,context_cursor_event_id,updated_at) VALUES (?,?,NULL,'v0.1',NULL,0,?)");
    q.run(roomId, 'tessa', t); q.run(roomId, 'gptina', t);
  }

  private event(row: Row): RoomEvent {
    return {
      eventId: Number(row.event_id), roomId: String(row.room_id),
      messageId: row.message_id == null ? null : String(row.message_id),
      runId: row.run_id == null ? null : String(row.run_id),
      agentId: row.agent_id == null ? null : row.agent_id as AgentId,
      type: row.type as EventType, seq: row.seq == null ? null : Number(row.seq),
      payload: JSON.parse(String(row.payload_json)) as Record<string, unknown>,
    };
  }

  private nextSeq(runId: string) {
    const row = this.db.prepare('SELECT COALESCE(MAX(seq),0)+1 n FROM events WHERE run_id=?').get(runId) as Row;
    return Number(row.n);
  }

  private run(row: Row): Run {
    return {
      runId: String(row.run_id), roomId: String(row.room_id), sourceMessageId: String(row.source_message_id),
      agentId: row.agent_id as AgentId, status: row.status as Run['status'], nextSeq: this.nextSeq(String(row.run_id)),
      bootstrapVersion: String(row.bootstrap_version), checkpointRef: row.checkpoint_ref == null ? null : String(row.checkpoint_ref),
      apiMode: String(row.api_mode), model: String(row.model), contextBuilderVersion: String(row.context_builder_version),
      conversationIdAtStart: row.conversation_id_at_start == null ? null : String(row.conversation_id_at_start),
      contextFromEventId: Number(row.context_from_event_id), contextThroughEventId: Number(row.context_through_event_id),
    };
  }

  private insertEvent(e: Omit<RoomEvent, 'eventId'>) {
    const r = this.db.prepare('INSERT INTO events(room_id,message_id,run_id,agent_id,type,seq,payload_json,created_at) VALUES (?,?,?,?,?,?,?,?)')
      .run(e.roomId, e.messageId, e.runId, e.agentId, e.type, e.seq, JSON.stringify(e.payload), iso());
    return { ...e, eventId: Number(r.lastInsertRowid) };
  }

  private publish(e: RoomEvent) { for (const fn of this.listeners.get(e.roomId) ?? []) fn(e); }

  postMessage(input: { roomId: string; clientMessageId: string; target: Target; content: string }) {
    const emitted: RoomEvent[] = [];
    const out = this.tx(() => {
      this.ensureRoom(input.roomId);
      const old = this.db.prepare('SELECT * FROM messages WHERE room_id=? AND client_message_id=?').get(input.roomId, input.clientMessageId) as Row | undefined;
      if (old) {
        if (old.target !== input.target || old.content !== input.content) throw new Error('idempotency_conflict');
        const message: Message = { messageId: String(old.message_id), roomId: String(old.room_id), clientMessageId: String(old.client_message_id), target: old.target as Target, content: String(old.content) };
        const runs = (this.db.prepare('SELECT * FROM runs WHERE source_message_id=? ORDER BY agent_id').all(message.messageId) as Row[]).map((r) => this.run(r));
        return { created: false, message, runs };
      }
      const message: Message = { messageId: randomUUID(), roomId: input.roomId, clientMessageId: input.clientMessageId, target: input.target, content: input.content };
      this.db.prepare("INSERT INTO messages VALUES (?,?,?,'alberto',?,?,?)").run(message.messageId, message.roomId, message.clientMessageId, message.target, message.content, iso());
      const me = this.insertEvent({ roomId: input.roomId, messageId: message.messageId, runId: null, agentId: null, type: 'message.created', seq: null, payload: { authorId: 'alberto', target: input.target, content: input.content } });
      emitted.push(me);
      const ids: AgentId[] = input.target === 'both' ? ['tessa', 'gptina'] : [input.target];
      const runs: Run[] = [];
      for (const agentId of ids) {
        const state = this.db.prepare('SELECT conversation_id,context_cursor_event_id FROM agents WHERE room_id=? AND agent_id=?').get(input.roomId, agentId) as Row;
        const run: Run = { runId: randomUUID(), roomId: input.roomId, sourceMessageId: message.messageId, agentId, status: 'queued', nextSeq: 2, bootstrapVersion: 'v0.1', checkpointRef: null, apiMode: 'responses-standard', model: 'unconfigured', contextBuilderVersion: 'v0.1', conversationIdAtStart: state.conversation_id == null ? null : String(state.conversation_id), contextFromEventId: Number(state.context_cursor_event_id) + 1, contextThroughEventId: me.eventId };
        this.db.prepare('INSERT INTO runs(run_id,room_id,source_message_id,agent_id,status,bootstrap_version,checkpoint_ref,api_mode,model,context_builder_version,conversation_id_at_start,context_from_event_id,context_through_event_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
          .run(run.runId, run.roomId, run.sourceMessageId, run.agentId, run.status, run.bootstrapVersion, run.checkpointRef, run.apiMode, run.model, run.contextBuilderVersion, run.conversationIdAtStart, run.contextFromEventId, run.contextThroughEventId, iso());
        emitted.push(this.insertEvent({ roomId: run.roomId, messageId: message.messageId, runId: run.runId, agentId, type: 'run.queued', seq: 1, payload: {} }));
        runs.push(run);
      }
      return { created: true, message, runs };
    });
    emitted.forEach((e) => this.publish(e));
    return out;
  }

  async executeRuns(runIds: string[], adapters: Record<AgentId, AgentAdapter>) {
    await Promise.allSettled(runIds.map((id) => this.executeRun(id, adapters)));
  }

  private runEvent(run: Run, type: EventType, payload: Record<string, unknown>) {
    return this.insertEvent({ roomId: run.roomId, messageId: run.sourceMessageId, runId: run.runId, agentId: run.agentId, type, seq: run.nextSeq++, payload });
  }

  private context(run: Run) {
    const rows = this.db.prepare("SELECT * FROM events WHERE room_id=? AND event_id>=? AND event_id<=? AND type IN ('message.created','response.completed') ORDER BY event_id")
      .all(run.roomId, run.contextFromEventId, run.contextThroughEventId) as Row[];
    return rows.map((r) => { const e = this.event(r); return { ...e, payload: { ...e.payload, authorId: e.type === 'response.completed' ? e.agentId : e.payload.authorId, privilege: 'room-content' } }; });
  }

  private async executeRun(runId: string, adapters: Record<AgentId, AgentAdapter>) {
    const run = this.getRun(runId); if (!run) throw new Error('run_not_found'); if (run.status !== 'queued') return;
    const started = this.tx(() => { this.db.prepare("UPDATE runs SET status='streaming',started_at=? WHERE run_id=?").run(iso(), runId); run.status = 'streaming'; return this.runEvent(run, 'run.started', {}); });
    this.publish(started);
    try {
      let text = '';
      for await (const chunk of adapters[run.agentId].generate({ agentId: run.agentId, roomId: run.roomId, runId, context: this.context(run) })) {
        text += chunk; const e = this.tx(() => this.runEvent(run, 'response.delta', { text: chunk })); this.publish(e);
      }
      const done = this.tx(() => {
        const t = iso(); this.db.prepare("UPDATE runs SET status='completed',finished_at=? WHERE run_id=?").run(t, runId);
        this.db.prepare('UPDATE agents SET context_cursor_event_id=?,updated_at=? WHERE room_id=? AND agent_id=?').run(run.contextThroughEventId, t, run.roomId, run.agentId);
        run.status = 'completed'; return this.runEvent(run, 'response.completed', { text });
      }); this.publish(done);
    } catch (error) {
      const failed = this.tx(() => { const message = error instanceof Error ? error.message : 'unknown_error'; this.db.prepare("UPDATE runs SET status='failed',error_message=?,finished_at=? WHERE run_id=?").run(message, iso(), runId); run.status = 'failed'; return this.runEvent(run, 'run.failed', { message }); });
      this.publish(failed);
    }
  }

  listEvents(roomId: string, after = 0) { return (this.db.prepare('SELECT * FROM events WHERE room_id=? AND event_id>? ORDER BY event_id').all(roomId, after) as Row[]).map((r) => this.event(r)); }
  subscribe(roomId: string, fn: Listener) { const set = this.listeners.get(roomId) ?? new Set<Listener>(); set.add(fn); this.listeners.set(roomId, set); return () => { set.delete(fn); if (!set.size) this.listeners.delete(roomId); }; }
  subscribeWithReplay(roomId: string, after: number, fn: Listener) {
    let replay = true; const buffered: RoomEvent[] = []; const off = this.subscribe(roomId, (e) => replay ? buffered.push(e) : fn(e)); let last = after;
    for (const e of this.listEvents(roomId, after)) { if (e.eventId > last) { fn(e); last = e.eventId; } }
    for (const e of buffered) { if (e.eventId > last) { fn(e); last = e.eventId; } }
    replay = false; return off;
  }
  getRun(runId: string) { const r = this.db.prepare('SELECT * FROM runs WHERE run_id=?').get(runId) as Row | undefined; return r ? this.run(r) : undefined; }
  getAgentCursor(roomId: string, agentId: AgentId) { this.ensureRoom(roomId); const r = this.db.prepare('SELECT context_cursor_event_id FROM agents WHERE room_id=? AND agent_id=?').get(roomId, agentId) as Row; return Number(r.context_cursor_event_id); }
}
