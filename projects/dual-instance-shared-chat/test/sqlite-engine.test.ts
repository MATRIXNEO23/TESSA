import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SqliteRoomEngine } from '../src/sqlite-engine.js';
import type { AgentAdapter, AgentId, RoomEvent } from '../src/core.js';

const chunks = (parts: string[], fail = false): AgentAdapter => ({
  async *generate() {
    for (const part of parts) yield part;
    if (fail) throw new Error('boom');
  },
});

const adapters = (
  tessa = chunks(['T']),
  gptina = chunks(['G']),
): Record<AgentId, AgentAdapter> => ({ tessa, gptina });

const withDb = (fn: (path: string) => Promise<void> | void) => async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dual-chat-'));
  const path = join(dir, 'room.sqlite');
  try {
    await fn(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test('idempotency survives engine restart', withDb(async (path) => {
  let engine = new SqliteRoomEngine(path);
  const first = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'same',
    target: 'both',
    content: 'x',
  });
  await engine.executeRuns(first.runs.map((run) => run.runId), adapters());
  const firstIds = first.runs.map((run) => run.runId).sort();
  const eventCount = engine.listEvents('room').length;
  engine.close();

  engine = new SqliteRoomEngine(path);
  const retry = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'same',
    target: 'both',
    content: 'x',
  });
  assert.equal(retry.created, false);
  assert.equal(retry.message.messageId, first.message.messageId);
  assert.deepEqual(retry.runs.map((run) => run.runId).sort(), firstIds);
  assert.equal(engine.listEvents('room').length, eventCount);
  engine.close();
}));

test('replay survives restart and then continues live without duplicates', withDb(async (path) => {
  let engine = new SqliteRoomEngine(path);
  const first = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'first',
    target: 'tessa',
    content: 'prima',
  });
  await engine.executeRuns(first.runs.map((run) => run.runId), adapters());
  const beforeRestart = engine.listEvents('room');
  const after = beforeRestart[1]!.eventId;
  engine.close();

  engine = new SqliteRoomEngine(path);
  const delivered: RoomEvent[] = [];
  const unsubscribe = engine.subscribeWithReplay('room', after, (event) => {
    delivered.push(event);
  });
  const second = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'second',
    target: 'gptina',
    content: 'dopo',
  });
  await engine.executeRuns(second.runs.map((run) => run.runId), adapters());
  unsubscribe();

  const expected = engine.listEvents('room', after).map((event) => event.eventId);
  assert.deepEqual(delivered.map((event) => event.eventId), expected);
  assert.equal(new Set(expected).size, expected.length);
  engine.close();
}));

test('failed persistent run does not advance cursor and does not block peer', withDb(async (path) => {
  const engine = new SqliteRoomEngine(path);
  const result = engine.postMessage({
    roomId: 'room',
    clientMessageId: 'both',
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
  assert.equal(engine.getAgentCursor('room', 'tessa'), 0);
  assert.ok(engine.getAgentCursor('room', 'gptina') > 0);
  engine.close();
}));
