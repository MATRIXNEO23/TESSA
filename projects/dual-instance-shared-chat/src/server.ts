import Fastify from 'fastify';
import {
  RoomEngine,
  type AgentAdapter,
  type AgentId,
  type Target,
} from './core.js';
import { SqliteRoomEngine } from './sqlite-engine.js';

type RoomEngineLike = Pick<
  RoomEngine,
  'postMessage' | 'executeRuns' | 'subscribeWithReplay'
>;

const isTarget = (value: unknown): value is Target =>
  value === 'tessa' || value === 'gptina' || value === 'both';

const sse = (event: {
  eventId: number;
  type: string;
}) =>
  'id: ' + event.eventId + '\n' +
  'event: ' + event.type + '\n' +
  'data: ' + JSON.stringify(event) + '\n\n';

export function buildServer(
  engine: RoomEngineLike,
  adapters: Record<AgentId, AgentAdapter>,
) {
  const app = Fastify({ logger: true });

  app.post('/api/rooms/:roomId/messages', async (request, reply) => {
    const { roomId } = request.params as { roomId: string };
    const body = request.body as {
      client_message_id?: unknown;
      target?: unknown;
      content?: unknown;
    };

    if (
      typeof body?.client_message_id !== 'string' ||
      !isTarget(body?.target) ||
      typeof body?.content !== 'string' ||
      body.content.length === 0
    ) {
      return reply.code(400).send({ error: 'invalid_message' });
    }

    try {
      const result = engine.postMessage({
        roomId,
        clientMessageId: body.client_message_id,
        target: body.target,
        content: body.content,
      });

      if (result.created) {
        void engine.executeRuns(
          result.runs.map((run) => run.runId),
          adapters,
        );
      }

      return reply.code(result.created ? 202 : 200).send({
        message_id: result.message.messageId,
        run_ids: result.runs.map((run) => run.runId),
        idempotent_replay: !result.created,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'idempotency_conflict') {
        return reply.code(409).send({ error: 'idempotency_conflict' });
      }
      throw error;
    }
  });

  app.get('/api/rooms/:roomId/events', async (request, reply) => {
    const { roomId } = request.params as { roomId: string };
    const { after } = request.query as { after?: string };
    const afterId = Number(after ?? 0);

    if (!Number.isSafeInteger(afterId) || afterId < 0) {
      return reply.code(400).send({ error: 'invalid_after' });
    }

    reply.hijack();
    reply.raw.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    });

    const unsubscribe = engine.subscribeWithReplay(
      roomId,
      afterId,
      (event) => {
        reply.raw.write(sse(event));
      },
    );

    request.raw.on('close', unsubscribe);
  });

  return app;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const engine = new SqliteRoomEngine(
    process.env.DB_PATH ?? './dual-instance-shared-chat.sqlite',
  );
  const unavailable = (agentId: AgentId): AgentAdapter => ({
    async *generate() {
      throw new Error(agentId + '_adapter_not_configured');
    },
  });

  const app = buildServer(engine, {
    tessa: unavailable('tessa'),
    gptina: unavailable('gptina'),
  });

  app.addHook('onClose', async () => {
    engine.close();
  });

  await app.listen({
    host: process.env.HOST ?? '127.0.0.1',
    port: Number(process.env.PORT ?? 3000),
  });
}
