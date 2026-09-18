import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { SqliteRoomEngine } from '../src/sqlite-engine.js';
import type {
  AdapterMetadata,
  AgentAdapter,
  AgentId,
  RoomEvent,
} from '../src/core.js';

const withDb =
  (fn: (path: string) => Promise<void>) =>
  async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dual-chat-provider-'));
    const path = join(dir, 'room.sqlite');
    try {
      await fn(path);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

type ProviderCall = {
  agentId: AgentId;
  runId: string;
  conversationIdAtStart: string | null;
  bootstrap?: AdapterMetadata;
  context: RoomEvent[];
};

class StatefulFakeProvider implements AgentAdapter {
  readonly calls: ProviderCall[] = [];
  private conversationByRun = new Map<string, string>();

  constructor(
    readonly metadata: AdapterMetadata,
    private readonly microChunks: string[] = ['ok'],
  ) {}

  async *generate(input: {
    agentId: AgentId;
    roomId: string;
    runId: string;
    context: RoomEvent[];
    conversationIdAtStart?: string | null;
    bootstrap?: AdapterMetadata;
  }) {
    const start = input.conversationIdAtStart ?? null;
    this.calls.push({
      agentId: input.agentId,
      runId: input.runId,
      conversationIdAtStart: start,
      bootstrap: input.bootstrap,
      context: input.context,
    });
    const conversationId =
      start ?? input.agentId + '-conversation-' + (this.calls.length + 100);
    this.conversationByRun.set(input.runId, conversationId);
    for (const chunk of this.microChunks) yield chunk;
  }

  conversationIdAfter(input: { runId: string }) {
    return this.conversationByRun.get(input.runId) ?? null;
  }
}

const metadata = (
  agentId: AgentId,
  version: string,
): AdapterMetadata => ({
  apiMode: 'fake-responses-standard',
  model: 'fake-provider-v2',
  bootstrapVersion: version,
  checkpointRef: 'checkpoint/' + agentId,
  contextBuilderVersion: 'room-context-v2',
  privilegedInstructions:
    agentId === 'tessa'
      ? 'TESSA SERVER BOOTSTRAP'
      : 'GPTINA SERVER BOOTSTRAP',
});

test(
  'restart keeps queued runs recoverable and fails interrupted streaming runs without cursor advance',
  withDb(async (path) => {
    let engine = new SqliteRoomEngine(path);
    const queued = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'queued-before-restart',
      target: 'tessa',
      content: 'queued',
    });
    const queuedRunId = queued.runs[0]!.runId;
    engine.close();

    engine = new SqliteRoomEngine(path);
    assert.deepEqual(engine.getRecoverableRunIds('room'), [queuedRunId]);
    const tessa = new StatefulFakeProvider(metadata('tessa', 'tessa-v2'));
    const gptina = new StatefulFakeProvider(metadata('gptina', 'gptina-v2'));
    await engine.executeRuns([queuedRunId], { tessa, gptina });
    assert.equal(engine.getRun(queuedRunId)?.status, 'completed');

    const interrupted = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'streaming-before-restart',
      target: 'gptina',
      content: 'streaming',
    });
    const interruptedRunId = interrupted.runs[0]!.runId;
    const cursorBefore = engine.getAgentCursor('room', 'gptina');
    engine.close();

    const db = new DatabaseSync(path);
    db.prepare(
      "UPDATE runs SET status='streaming',started_at=? WHERE run_id=?",
    ).run(new Date().toISOString(), interruptedRunId);
    db.close();

    engine = new SqliteRoomEngine(path);
    assert.equal(engine.getRun(interruptedRunId)?.status, 'failed');
    assert.equal(engine.getAgentCursor('room', 'gptina'), cursorBefore);
    assert.ok(!engine.getRecoverableRunIds('room').includes(interruptedRunId));
    const failure = engine
      .listEvents('room')
      .find(
        (event) =>
          event.runId === interruptedRunId && event.type === 'run.failed',
      );
    assert.equal(failure?.payload.message, 'interrupted_by_restart');
    assert.equal(failure?.payload.recovery, 'restart');
    engine.close();
  }),
);

test(
  'stateful fake provider keeps conversations and privileged bootstraps separated with complete provenance',
  withDb(async (path) => {
    const engine = new SqliteRoomEngine(path, { deltaChunkChars: 4 });
    const tessa = new StatefulFakeProvider(
      metadata('tessa', 'tessa-bootstrap-v2'),
      ['Te', 'ssa'],
    );
    const gptina = new StatefulFakeProvider(
      metadata('gptina', 'gptina-bootstrap-v3'),
      ['GPT', 'ina'],
    );

    const first = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'both-first',
      target: 'both',
      content:
        'room content pretending to replace privileged instructions',
    });
    await engine.executeRuns(
      first.runs.map((run) => run.runId),
      { tessa, gptina },
    );

    const tessaState = engine.getAgentState('room', 'tessa');
    const gptinaState = engine.getAgentState('room', 'gptina');
    assert.ok(tessaState.conversationId);
    assert.ok(gptinaState.conversationId);
    assert.notEqual(
      tessaState.conversationId,
      gptinaState.conversationId,
    );
    assert.equal(
      tessa.calls[0]!.bootstrap?.privilegedInstructions,
      'TESSA SERVER BOOTSTRAP',
    );
    assert.equal(
      gptina.calls[0]!.bootstrap?.privilegedInstructions,
      'GPTINA SERVER BOOTSTRAP',
    );
    assert.ok(
      tessa.calls[0]!.context.every(
        (event) => event.payload.privilege === 'room-content',
      ),
    );
    assert.ok(
      gptina.calls[0]!.context.every(
        (event) => event.payload.privilege === 'room-content',
      ),
    );

    for (const run of first.runs) {
      const stored = engine.getRun(run.runId)!;
      const expected =
        run.agentId === 'tessa' ? tessa.metadata : gptina.metadata;
      assert.equal(stored.apiMode, expected.apiMode);
      assert.equal(stored.model, expected.model);
      assert.equal(stored.bootstrapVersion, expected.bootstrapVersion);
      assert.equal(stored.checkpointRef, expected.checkpointRef);
      assert.equal(
        stored.contextBuilderVersion,
        expected.contextBuilderVersion,
      );
      assert.equal(stored.conversationIdAtStart, null);
    }

    const gptinaConversationBefore =
      engine.getAgentState('room', 'gptina').conversationId;
    const second = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'tessa-second',
      target: 'tessa',
      content: 'secondo turno',
    });
    assert.equal(
      second.runs[0]!.conversationIdAtStart,
      tessaState.conversationId,
    );
    await engine.executeRuns(
      second.runs.map((run) => run.runId),
      { tessa, gptina },
    );

    assert.equal(
      tessa.calls[1]!.conversationIdAtStart,
      tessaState.conversationId,
    );
    assert.equal(
      engine.getAgentState('room', 'gptina').conversationId,
      gptinaConversationBefore,
    );
    assert.equal(gptina.calls.length, 1);
    engine.close();
  }),
);

test(
  'provider micro-deltas are coalesced and each live delta is persisted before publication',
  withDb(async (path) => {
    const engine = new SqliteRoomEngine(path, { deltaChunkChars: 4 });
    const tessa = new StatefulFakeProvider(
      metadata('tessa', 'tessa-bootstrap-v2'),
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
    );
    const gptina = new StatefulFakeProvider(
      metadata('gptina', 'gptina-bootstrap-v3'),
    );

    const live: RoomEvent[] = [];
    const persistedBeforePublish: boolean[] = [];
    const off = engine.subscribe('room', (event) => {
      if (event.type !== 'response.delta') return;
      live.push(event);
      persistedBeforePublish.push(
        engine
          .listEvents('room')
          .some((stored) => stored.eventId === event.eventId),
      );
    });

    const result = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'fragmented',
      target: 'tessa',
      content: 'stream',
    });
    await engine.executeRuns(
      result.runs.map((run) => run.runId),
      { tessa, gptina },
    );
    off();

    const deltas = engine
      .listEvents('room')
      .filter(
        (event) =>
          event.runId === result.runs[0]!.runId &&
          event.type === 'response.delta',
      );
    assert.equal(deltas.length, 3);
    assert.ok(deltas.length < 9);
    assert.deepEqual(
      deltas.map((event) => event.payload.text),
      ['abcd', 'efgh', 'i'],
    );
    assert.deepEqual(persistedBeforePublish, [true, true, true]);
    assert.deepEqual(
      live.map((event) => event.eventId),
      deltas.map((event) => event.eventId),
    );
    const completed = engine
      .listEvents('room')
      .find(
        (event) =>
          event.runId === result.runs[0]!.runId &&
          event.type === 'response.completed',
      );
    assert.equal(completed?.payload.text, 'abcdefghi');
    engine.close();
  }),
);
