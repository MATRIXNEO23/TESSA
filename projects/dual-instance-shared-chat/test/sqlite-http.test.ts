import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { buildServer } from '../src/server.js';
import { SqliteRoomEngine } from '../src/sqlite-engine.js';
import type { AgentAdapter, AgentId } from '../src/core.js';

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

const withDb =
  (fn: (path: string) => Promise<void>) =>
  async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dual-chat-http-'));
    const path = join(dir, 'room.sqlite');
    try {
      await fn(path);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

async function waitForRun(
  engine: SqliteRoomEngine,
  runId: string,
  expected: 'completed' | 'failed',
) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (engine.getRun(runId)?.status === expected) return;
    await delay(5);
  }
  throw new Error('run_timeout:' + runId + ':' + expected);
}

type Reader = {
  read(): Promise<{ value?: Uint8Array; done: boolean }>;
  cancel(reason?: unknown): Promise<void>;
};

async function readSseIds(reader: Reader, count: number) {
  const decoder = new TextDecoder();
  const ids: number[] = [];
  let buffer = '';

  while (ids.length < count) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) buffer += decoder.decode(value, { stream: true });

    while (buffer.includes('\n\n')) {
      const boundary = buffer.indexOf('\n\n');
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const idLine = block
        .split('\n')
        .find((line) => line.startsWith('id: '));
      if (idLine) ids.push(Number(idLine.slice(4)));
      if (ids.length >= count) break;
    }
  }

  return ids;
}

test(
  'HTTP idempotency survives a SQLite engine restart',
  withDb(async (path) => {
    let engine = new SqliteRoomEngine(path);
    let app = buildServer(engine, adapters());

    const first = await app.inject({
      method: 'POST',
      url: '/api/rooms/room/messages',
      payload: {
        client_message_id: 'http-retry',
        target: 'both',
        content: 'ciao',
      },
    });
    assert.equal(first.statusCode, 202);
    const firstBody = first.json() as {
      message_id: string;
      run_ids: string[];
      idempotent_replay: boolean;
    };
    assert.equal(firstBody.idempotent_replay, false);

    for (const runId of firstBody.run_ids) {
      await waitForRun(engine, runId, 'completed');
    }

    await app.close();
    engine.close();

    engine = new SqliteRoomEngine(path);
    app = buildServer(engine, adapters());

    const retry = await app.inject({
      method: 'POST',
      url: '/api/rooms/room/messages',
      payload: {
        client_message_id: 'http-retry',
        target: 'both',
        content: 'ciao',
      },
    });
    assert.equal(retry.statusCode, 200);
    const retryBody = retry.json() as typeof firstBody;
    assert.equal(retryBody.idempotent_replay, true);
    assert.equal(retryBody.message_id, firstBody.message_id);
    assert.deepEqual(
      [...retryBody.run_ids].sort(),
      [...firstBody.run_ids].sort(),
    );
    assert.equal(
      engine
        .listEvents('room')
        .filter((event) => event.type === 'message.created').length,
      1,
    );

    await app.close();
    engine.close();
  }),
);

test(
  'SSE reconnect replays persisted events then continues live without duplicates',
  withDb(async (path) => {
    const engine = new SqliteRoomEngine(path);
    const app = buildServer(engine, adapters());

    const first = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'sse-first',
      target: 'tessa',
      content: 'prima',
    });
    await engine.executeRuns(first.runs.map((run) => run.runId), adapters());

    const before = engine.listEvents('room');
    const after = before[1]!.eventId;
    const replayCount = engine.listEvents('room', after).length;

    const address = await app.listen({ host: '127.0.0.1', port: 0 });
    const controller = new AbortController();
    const response = await fetch(
      address + '/api/rooms/room/events?after=' + after,
      { signal: controller.signal },
    );
    assert.equal(response.status, 200);
    assert.match(
      response.headers.get('content-type') ?? '',
      /text\/event-stream/,
    );
    assert.ok(response.body);

    const reader = response.body!.getReader() as Reader;
    const replayIds = await readSseIds(reader, replayCount);

    const second = engine.postMessage({
      roomId: 'room',
      clientMessageId: 'sse-live',
      target: 'gptina',
      content: 'dopo',
    });
    await engine.executeRuns(second.runs.map((run) => run.runId), adapters());

    const allExpected = engine
      .listEvents('room', after)
      .map((event) => event.eventId);
    const remainingCount = allExpected.length - replayIds.length;
    const liveIds = await readSseIds(reader, remainingCount);
    const delivered = [...replayIds, ...liveIds];

    assert.deepEqual(delivered, allExpected);
    assert.equal(new Set(delivered).size, delivered.length);

    controller.abort();
    await reader.cancel().catch(() => undefined);
    await app.close();
    engine.close();
  }),
);
