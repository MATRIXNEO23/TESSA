import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RoomEngine,
  type AgentAdapter,
  type AgentId,
} from '../src/core.js';

const chunks = (parts: string[], fail = false): AgentAdapter => ({
  async *generate() {
    for (const part of parts) {
      await new Promise((resolve) => setTimeout(resolve, 1));
      yield part;
    }
    if (fail) throw new Error('boom');
  },
});

const adapters = (
  tessa = chunks(['T']),
  gptina = chunks(['G']),
): Record<AgentId, AgentAdapter> => ({ tessa, gptina });

test('sidebar fan-out keeps unselected agent idle', async () => {
  const engine = new RoomEngine();
  const result = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'm1',
    target: 'tessa',
    content: 'ciao',
  });

  assert.deepEqual(result.runs.map((run) => run.agentId), ['tessa']);
  await engine.executeRuns(result.runs.map((run) => run.runId), adapters());
  assert.equal(
    engine.listEvents('room').some((event) => event.agentId === 'gptina'),
    false,
  );
});

test('retry with same client_message_id is idempotent', () => {
  const engine = new RoomEngine();
  const first = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'same',
    target: 'both',
    content: 'x',
  });
  const retry = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'same',
    target: 'both',
    content: 'x',
  });

  assert.equal(retry.created, false);
  assert.equal(first.message.messageId, retry.message.messageId);
  assert.deepEqual(
    first.runs.map((run) => run.runId).sort(),
    retry.runs.map((run) => run.runId).sort(),
  );
  assert.equal(
    engine.listEvents('room').filter((event) => event.type === 'message.created')
      .length,
    1,
  );
});

test('both streams remain attributable with monotonic ids and per-run seq', async () => {
  const engine = new RoomEngine();
  const result = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'm2',
    target: 'both',
    content: 'x',
  });

  await engine.executeRuns(
    result.runs.map((run) => run.runId),
    adapters(chunks(['t1', 't2']), chunks(['g1', 'g2'])),
  );

  const events = engine.listEvents('room');
  const eventIds = events.map((event) => event.eventId);
  assert.deepEqual(eventIds, [...eventIds].sort((a, b) => a - b));

  for (const run of result.runs) {
    const seq = events
      .filter((event) => event.runId === run.runId)
      .map((event) => event.seq as number);
    assert.deepEqual(seq, [...seq].sort((a, b) => a - b));
  }
});

test('failure of one agent does not block the other', async () => {
  const engine = new RoomEngine();
  const result = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'm3',
    target: 'both',
    content: 'x',
  });

  await engine.executeRuns(
    result.runs.map((run) => run.runId),
    adapters(chunks([], true), chunks(['ok'])),
  );

  const tessa = result.runs.find((run) => run.agentId === 'tessa')!;
  const gptina = result.runs.find((run) => run.agentId === 'gptina')!;
  assert.equal(engine.getRun(tessa.runId)?.status, 'failed');
  assert.equal(engine.getRun(gptina.runId)?.status, 'completed');
});

test('agent output cannot create recursive runs', async () => {
  const engine = new RoomEngine();
  const result = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'm4',
    target: 'both',
    content: 'x',
  });

  await engine.executeRuns(result.runs.map((run) => run.runId), adapters());

  assert.equal(
    engine.listEvents('room').filter((event) => event.type === 'run.queued')
      .length,
    2,
  );
});

test('reselected agent catches up from its own cursor as room content', async () => {
  const engine = new RoomEngine();
  let seen: Array<{ payload: Record<string, unknown> }> = [];

  const capture: AgentAdapter = {
    async *generate(input) {
      seen = input.context;
      yield 'ok';
    },
  };

  let result = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'm5',
    target: 'tessa',
    content: 'solo tessa',
  });
  await engine.executeRuns(result.runs.map((run) => run.runId), adapters());

  result = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'm6',
    target: 'gptina',
    content: 'ora gptina',
  });
  await engine.executeRuns(
    result.runs.map((run) => run.runId),
    adapters(chunks(['unused']), capture),
  );

  assert.ok(seen.some((event) => event.payload.content === 'solo tessa'));
  assert.ok(
    seen.every((event) => event.payload.privilege === 'room-content'),
  );
});
