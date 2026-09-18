import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SqliteRoomEngine } from '../src/sqlite-engine.js';
import {
  buildRealOpenAIAdaptersFromEnv,
  createRealOpenAIAdapters,
  type OpenAIClientLike,
} from '../src/openai-adapter.js';
import type {
  AdapterMetadata,
  AgentAdapter,
  AgentId,
  RoomEvent,
} from '../src/core.js';

class FakeSDK implements OpenAIClientLike {
  conversationCreates = 0;
  responseCalls: Array<{
    conversation: string;
    instructions: string;
    input: string;
  }> = [];
  responseCounter = 0;

  conversations = {
    create: async () => {
      this.conversationCreates += 1;
      return { id: 'conv-' + this.conversationCreates };
    },
  };

  responses = {
    create: async (input: {
      conversation: string;
      instructions: string;
      input: string;
    }) => {
      this.responseCalls.push(input);
      this.responseCounter += 1;
      const id = 'resp-' + this.responseCounter;
      return (async function* () {
        yield { type: 'response.created', response: { id } };
        yield { type: 'response.output_text.delta', delta: 'ciao ' };
        yield { type: 'response.output_text.delta', delta: 'Alberto' };
        yield {
          type: 'response.completed',
          response: { id, status: 'completed' },
        };
      })();
    },
  } as OpenAIClientLike['responses'];
}

const context: RoomEvent[] = [
  {
    eventId: 1,
    roomId: 'room',
    messageId: 'message',
    runId: null,
    agentId: null,
    type: 'message.created',
    seq: null,
    payload: {
      authorId: 'alberto',
      content: 'ciao',
      privilege: 'room-content',
    },
  },
];

test('real adapters are disabled by default', () => {
  assert.equal(buildRealOpenAIAdaptersFromEnv({}), null);
});

test('real adapter keeps conversations separate and captures response ids', async () => {
  const client = new FakeSDK();
  const adapters = createRealOpenAIAdapters(client, 'fake-real-model', 32);

  const collect = async (
    adapter: AgentAdapter,
    agentId: AgentId,
    runId: string,
    conversationIdAtStart: string | null,
  ) => {
    let text = '';
    for await (const chunk of adapter.generate({
      agentId,
      roomId: 'room',
      runId,
      context,
      conversationIdAtStart,
      bootstrap: adapter.metadata,
    })) {
      text += chunk;
    }
    return text;
  };

  assert.equal(
    await collect(adapters.tessa, 'tessa', 't1', null),
    'ciao Alberto',
  );
  assert.equal(
    await adapters.tessa.conversationIdAfter?.({
      agentId: 'tessa',
      roomId: 'room',
      runId: 't1',
      conversationIdAtStart: null,
    }),
    'conv-1',
  );
  assert.equal(
    await adapters.tessa.responseIdAfter?.({
      agentId: 'tessa',
      roomId: 'room',
      runId: 't1',
    }),
    'resp-1',
  );

  await collect(adapters.tessa, 'tessa', 't2', 'conv-1');
  await collect(adapters.gptina, 'gptina', 'g1', null);

  assert.equal(client.conversationCreates, 2);
  assert.equal(client.responseCalls[1]!.conversation, 'conv-1');
  assert.equal(client.responseCalls[2]!.conversation, 'conv-2');
  assert.notEqual(
    client.responseCalls[0]!.instructions,
    client.responseCalls[2]!.instructions,
  );
  assert.match(client.responseCalls[0]!.input, /ROOM CONTENT/);
});

test('SQLite fails closed before provider call when required metadata is missing', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dual-chat-real-preflight-'));
  const path = join(dir, 'room.sqlite');
  try {
    const engine = new SqliteRoomEngine(path);
    let called = false;
    const required: AgentAdapter = {
      requiresCompleteMetadata: true,
      async *generate() {
        called = true;
        yield 'should-not-run';
      },
    };
    const fallback: AgentAdapter = {
      async *generate() {
        yield 'unused';
      },
    };

    const posted = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'preflight',
      target: 'tessa',
      content: 'test',
    });
    await engine.executeRuns(
      posted.runs.map((run) => run.runId),
      { tessa: required, gptina: fallback },
    );

    const run = engine.getRun(posted.runs[0]!.runId)!;
    assert.equal(run.status, 'failed');
    assert.equal(run.errorCode, 'adapter_metadata_missing');
    assert.equal(called, false);
    assert.equal(
      engine
        .listEvents('room')
        .some(
          (event) =>
            event.runId === run.runId && event.type === 'run.started',
        ),
      false,
    );
    engine.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('SQLite persists provider response id before completed publication', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dual-chat-response-id-'));
  const path = join(dir, 'room.sqlite');
  try {
    const engine = new SqliteRoomEngine(path, { deltaChunkChars: 2 });
    const metadata: AdapterMetadata = {
      apiMode: 'responses-conversations-streaming',
      model: 'fake-real-model',
      bootstrapVersion: 'real-v1',
      checkpointRef: null,
      contextBuilderVersion: 'room-context-v2',
      privilegedInstructions: 'server-only-bootstrap',
    };
    const adapter: AgentAdapter = {
      metadata,
      requiresCompleteMetadata: true,
      async *generate() {
        yield 'ok';
      },
      conversationIdAfter: () => 'conv-test',
      responseIdAfter: () => 'resp-test',
    };

    let persistedBeforeCompletedPublish = false;
    const off = engine.subscribe('room', (event) => {
      if (event.type !== 'response.completed') return;
      persistedBeforeCompletedPublish =
        engine.getRun(event.runId!)?.responseId === 'resp-test';
    });

    const posted = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'response-id',
      target: 'tessa',
      content: 'test',
    });
    await engine.executeRuns(
      posted.runs.map((run) => run.runId),
      { tessa: adapter, gptina: adapter },
    );
    off();

    const run = engine.getRun(posted.runs[0]!.runId)!;
    assert.equal(run.status, 'completed');
    assert.equal(run.responseId, 'resp-test');
    assert.equal(run.errorCode, null);
    assert.equal(persistedBeforeCompletedPublish, true);
    engine.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
