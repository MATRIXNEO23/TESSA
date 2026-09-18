import { randomUUID } from 'node:crypto';

export type AgentId = 'tessa' | 'gptina';
export type Target = AgentId | 'both';
export type EventType =
  | 'message.created'
  | 'run.queued'
  | 'run.started'
  | 'response.delta'
  | 'response.completed'
  | 'run.failed'
  | 'run.cancelled';

export interface RoomEvent {
  eventId: number;
  roomId: string;
  messageId: string | null;
  runId: string | null;
  agentId: AgentId | null;
  type: EventType;
  seq: number | null;
  payload: Record<string, unknown>;
}

export interface Run {
  runId: string;
  roomId: string;
  sourceMessageId: string;
  agentId: AgentId;
  status: 'queued' | 'streaming' | 'completed' | 'failed' | 'cancelled';
  nextSeq: number;
  bootstrapVersion: string;
  checkpointRef: string | null;
  apiMode: string;
  model: string;
  contextBuilderVersion: string;
  conversationIdAtStart: string | null;
  contextFromEventId: number;
  contextThroughEventId: number;
}

export interface Message {
  messageId: string;
  roomId: string;
  clientMessageId: string;
  target: Target;
  content: string;
}

export interface AdapterMetadata {
  apiMode: string;
  model: string;
  bootstrapVersion: string;
  checkpointRef: string | null;
  contextBuilderVersion: string;
  privilegedInstructions: string;
}

export interface AgentAdapter {
  metadata?: AdapterMetadata;
  generate(input: {
    agentId: AgentId;
    roomId: string;
    runId: string;
    context: RoomEvent[];
    conversationIdAtStart?: string | null;
    bootstrap?: AdapterMetadata;
  }): AsyncIterable<string>;
  conversationIdAfter?(input: {
    agentId: AgentId;
    roomId: string;
    runId: string;
    conversationIdAtStart: string | null;
  }): string | null | Promise<string | null>;
}

type AgentState = { conversationId: string | null; cursor: number };
type Listener = (event: RoomEvent) => void;

export class RoomEngine {
  private nextEventId = 1;
  private events: RoomEvent[] = [];
  private messages = new Map<string, Message>();
  private idempotency = new Map<string, string>();
  private runs = new Map<string, Run>();
  private agents = new Map<string, AgentState>();
  private listeners = new Map<string, Set<Listener>>();

  private agentKey(roomId: string, agentId: AgentId) {
    return `${roomId}:${agentId}`;
  }

  private agent(roomId: string, agentId: AgentId) {
    const key = this.agentKey(roomId, agentId);
    let state = this.agents.get(key);
    if (!state) {
      state = { conversationId: null, cursor: 0 };
      this.agents.set(key, state);
    }
    return state;
  }

  private emit(event: Omit<RoomEvent, 'eventId'>) {
    const full: RoomEvent = { ...event, eventId: this.nextEventId++ };
    this.events.push(full);
    for (const listener of this.listeners.get(full.roomId) ?? []) listener(full);
    return full;
  }

  postMessage(input: {
    roomId: string;
    clientMessageId: string;
    target: Target;
    content: string;
  }) {
    const key = `${input.roomId}:${input.clientMessageId}`;
    const existingId = this.idempotency.get(key);

    if (existingId) {
      const message = this.messages.get(existingId)!;
      if (message.target !== input.target || message.content !== input.content) {
        throw new Error('idempotency_conflict');
      }
      return {
        created: false,
        message,
        runs: [...this.runs.values()].filter(
          (run) => run.sourceMessageId === message.messageId,
        ),
      };
    }

    const message: Message = {
      messageId: randomUUID(),
      roomId: input.roomId,
      clientMessageId: input.clientMessageId,
      target: input.target,
      content: input.content,
    };

    this.messages.set(message.messageId, message);
    this.idempotency.set(key, message.messageId);

    const messageEvent = this.emit({
      roomId: input.roomId,
      messageId: message.messageId,
      runId: null,
      agentId: null,
      type: 'message.created',
      seq: null,
      payload: {
        authorId: 'alberto',
        target: input.target,
        content: input.content,
      },
    });

    const agentIds: AgentId[] =
      input.target === 'both' ? ['tessa', 'gptina'] : [input.target];
    const runs: Run[] = [];

    for (const agentId of agentIds) {
      const state = this.agent(input.roomId, agentId);
      const run: Run = {
        runId: randomUUID(),
        roomId: input.roomId,
        sourceMessageId: message.messageId,
        agentId,
        status: 'queued',
        nextSeq: 2,
        bootstrapVersion: 'v0.1',
        checkpointRef: null,
        apiMode: 'responses-standard',
        model: 'unconfigured',
        contextBuilderVersion: 'v0.1',
        conversationIdAtStart: state.conversationId,
        contextFromEventId: state.cursor + 1,
        contextThroughEventId: messageEvent.eventId,
      };
      this.runs.set(run.runId, run);
      this.emit({
        roomId: run.roomId,
        messageId: message.messageId,
        runId: run.runId,
        agentId,
        type: 'run.queued',
        seq: 1,
        payload: {},
      });
      runs.push(run);
    }

    return { created: true, message, runs };
  }

  async executeRuns(
    runIds: string[],
    adapters: Record<AgentId, AgentAdapter>,
  ) {
    await Promise.allSettled(
      runIds.map((runId) => this.executeRun(runId, adapters)),
    );
  }

  private async executeRun(
    runId: string,
    adapters: Record<AgentId, AgentAdapter>,
  ) {
    const run = this.runs.get(runId);
    if (!run) throw new Error('run_not_found');

    run.status = 'streaming';
    this.emitRun(run, 'run.started', {});

    const state = this.agent(run.roomId, run.agentId);
    const context = this.events
      .filter(
        (event) =>
          event.roomId === run.roomId &&
          event.eventId >= run.contextFromEventId &&
          event.eventId <= run.contextThroughEventId &&
          (event.type === 'message.created' ||
            event.type === 'response.completed'),
      )
      .map((event) => ({
        ...event,
        payload: {
          ...event.payload,
          authorId:
            event.type === 'response.completed'
              ? event.agentId
              : event.payload.authorId,
          privilege: 'room-content',
        },
      }));

    try {
      let finalText = '';
      for await (const chunk of adapters[run.agentId].generate({
        agentId: run.agentId,
        roomId: run.roomId,
        runId,
        context,
      })) {
        finalText += chunk;
        this.emitRun(run, 'response.delta', { text: chunk });
      }
      run.status = 'completed';
      this.emitRun(run, 'response.completed', { text: finalText });
      state.cursor = run.contextThroughEventId;
    } catch (error) {
      run.status = 'failed';
      this.emitRun(run, 'run.failed', {
        message: error instanceof Error ? error.message : 'unknown_error',
      });
    }
  }

  private emitRun(
    run: Run,
    type: EventType,
    payload: Record<string, unknown>,
  ) {
    return this.emit({
      roomId: run.roomId,
      messageId: run.sourceMessageId,
      runId: run.runId,
      agentId: run.agentId,
      type,
      seq: run.nextSeq++,
      payload,
    });
  }

  listEvents(roomId: string, after = 0) {
    return this.events.filter(
      (event) => event.roomId === roomId && event.eventId > after,
    );
  }

  subscribe(roomId: string, listener: Listener) {
    const set = this.listeners.get(roomId) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(roomId, set);
    return () => {
      set.delete(listener);
      if (set.size === 0) this.listeners.delete(roomId);
    };
  }

  subscribeWithReplay(roomId: string, after: number, listener: Listener) {
    let replaying = true;
    const buffered: RoomEvent[] = [];

    const unsubscribe = this.subscribe(roomId, (event) => {
      if (replaying) {
        buffered.push(event);
        return;
      }
      listener(event);
    });

    let lastEventId = after;

    for (const event of this.listEvents(roomId, after)) {
      if (event.eventId <= lastEventId) continue;
      listener(event);
      lastEventId = event.eventId;
    }

    for (const event of buffered) {
      if (event.eventId <= lastEventId) continue;
      listener(event);
      lastEventId = event.eventId;
    }

    replaying = false;
    return unsubscribe;
  }

  getRun(runId: string) {
    return this.runs.get(runId);
  }

  getAgentCursor(roomId: string, agentId: AgentId) {
    return this.agent(roomId, agentId).cursor;
  }
}
