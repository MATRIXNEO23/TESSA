import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { SqliteRoomEngine } from '../src/sqlite-engine.js';
import { buildRealOpenAIAdaptersFromEnv } from '../src/openai-adapter.js';
import type { AgentId, RoomEvent, Target } from '../src/core.js';

const adapters = buildRealOpenAIAdaptersFromEnv();
if (!adapters) {
  throw new Error(
    'REAL_RESPONSES_ENABLED=1 is required for the real smoke test',
  );
}

const roomId =
  process.env.REAL_SMOKE_ROOM_ID ??
  'real-responses-smoke-' + new Date().toISOString().replace(/[:.]/g, '-');
const dbPath =
  process.env.REAL_SMOKE_DB_PATH ?? './real-responses-smoke.sqlite';

const engine = new SqliteRoomEngine(dbPath, { deltaChunkChars: 32 });
const live: RoomEvent[] = [];
const persistedBeforePublish: boolean[] = [];

const offLive = engine.subscribe(roomId, (event) => {
  live.push(event);
  if (event.type === 'response.delta') {
    persistedBeforePublish.push(
      engine
        .listEvents(roomId)
        .some((stored) => stored.eventId === event.eventId),
    );
  }
});

const state = (agentId: AgentId) =>
  engine.getAgentState(roomId, agentId);

const execute = async (target: Target, content: string) => {
  const before = {
    tessa: state('tessa'),
    gptina: state('gptina'),
  };
  const posted = engine.postMessage({
    roomId,
    clientMessageId: randomUUID(),
    target,
    content,
  });
  await engine.executeRuns(
    posted.runs.map((run) => run.runId),
    adapters,
  );

  const stored = posted.runs.map((run) => engine.getRun(run.runId)!);
  for (const run of stored) {
    assert.equal(run.status, 'completed');
    assert.ok(run.responseId?.startsWith('resp_'));
    assert.equal(run.errorCode, null);
  }

  if (target === 'tessa') {
    assert.deepEqual(state('gptina'), before.gptina);
  } else if (target === 'gptina') {
    assert.deepEqual(state('tessa'), before.tessa);
  }

  return stored;
};

try {
  const tessaRuns = await execute(
    'tessa',
    'Smoke reale Tessa: rispondi con una frase breve.',
  );
  const tessaConversation = state('tessa').conversationId;
  assert.ok(tessaConversation);
  assert.equal(state('gptina').conversationId, null);

  const gptinaRuns = await execute(
    'gptina',
    'Smoke reale GPTina: rispondi con una frase breve.',
  );
  const gptinaConversation = state('gptina').conversationId;
  assert.ok(gptinaConversation);
  assert.notEqual(tessaConversation, gptinaConversation);
  assert.equal(state('tessa').conversationId, tessaConversation);

  const beforeBothEventId =
    engine.listEvents(roomId).at(-1)?.eventId ?? 0;
  const replayAndLive: number[] = [];
  const offReplay = engine.subscribeWithReplay(
    roomId,
    beforeBothEventId,
    (event) => replayAndLive.push(event.eventId),
  );

  const bothRuns = await execute(
    'both',
    'Smoke reale condiviso: ognuna risponda separatamente e brevemente.',
  );
  offReplay();

  assert.equal(state('tessa').conversationId, tessaConversation);
  assert.equal(state('gptina').conversationId, gptinaConversation);
  assert.ok(persistedBeforePublish.length > 0);
  assert.ok(persistedBeforePublish.every(Boolean));

  const expectedAfterAnchor = engine
    .listEvents(roomId, beforeBothEventId)
    .map((event) => event.eventId);
  assert.deepEqual(replayAndLive, expectedAfterAnchor);
  assert.equal(new Set(replayAndLive).size, replayAndLive.length);

  const responseIds = [
    ...tessaRuns,
    ...gptinaRuns,
    ...bothRuns,
  ].map((run) => run.responseId);
  assert.equal(
    new Set(responseIds).size,
    responseIds.length,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        room_id: roomId,
        model: adapters.tessa.metadata?.model,
        conversations: {
          tessa: tessaConversation,
          gptina: gptinaConversation,
        },
        response_ids: responseIds,
        live_delta_count: live.filter(
          (event) => event.type === 'response.delta',
        ).length,
        replay_event_count: replayAndLive.length,
      },
      null,
      2,
    ),
  );
} finally {
  offLive();
  engine.close();
}
