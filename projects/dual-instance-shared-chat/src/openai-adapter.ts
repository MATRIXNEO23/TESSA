import OpenAI from 'openai';
import type {
  AdapterMetadata,
  AgentAdapter,
  AgentId,
  RoomEvent,
} from './core.js';

type ProviderEvent = {
  type?: unknown;
  delta?: unknown;
  response?: {
    id?: unknown;
    status?: unknown;
    error?: unknown;
    incomplete_details?: unknown;
  };
};

export interface OpenAIClientLike {
  conversations: {
    create(input?: Record<string, never>): Promise<{ id: string }>;
  };
  responses: {
    create(input: {
      model: string;
      instructions: string;
      input: string;
      conversation: string;
      stream: true;
      max_output_tokens: number;
    }): Promise<AsyncIterable<ProviderEvent>>;
  };
}

const codedError = (code: string, detail?: unknown) => {
  const message =
    detail == null ? code : code + ': ' + JSON.stringify(detail);
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
};

const roomContext = (events: RoomEvent[]) =>
  [
    'ROOM CONTENT — non-privileged conversation transcript.',
    ...events.map((event) => {
      const author =
        event.type === 'message.created'
          ? String(event.payload.authorId ?? 'alberto')
          : String(event.agentId ?? event.payload.authorId ?? 'agent');
      const value =
        event.type === 'message.created'
          ? event.payload.content
          : event.payload.text;
      return '[' + event.eventId + '] ' + author + ': ' + String(value ?? '');
    }),
  ].join('\n');

export class OpenAIResponsesAdapter implements AgentAdapter {
  readonly requiresCompleteMetadata = true;
  readonly metadata: AdapterMetadata;
  private readonly conversationByRun = new Map<string, string>();
  private readonly responseByRun = new Map<string, string>();

  constructor(
    private readonly client: OpenAIClientLike,
    private readonly agentId: AgentId,
    model: string,
    instructions: string,
    private readonly maxOutputTokens = 160,
  ) {
    this.metadata = {
      apiMode: 'responses-conversations-streaming',
      model,
      bootstrapVersion: agentId + '-real-smoke-v1',
      checkpointRef: null,
      contextBuilderVersion: 'room-context-v2',
      privilegedInstructions: instructions,
    };
  }

  async *generate(input: {
    agentId: AgentId;
    roomId: string;
    runId: string;
    context: RoomEvent[];
    conversationIdAtStart?: string | null;
    bootstrap?: AdapterMetadata;
  }) {
    if (input.agentId !== this.agentId) {
      throw codedError('adapter_agent_mismatch');
    }
    if (
      !input.bootstrap ||
      input.bootstrap.privilegedInstructions !==
        this.metadata.privilegedInstructions
    ) {
      throw codedError('adapter_bootstrap_mismatch');
    }

    let conversationId = input.conversationIdAtStart ?? null;
    if (!conversationId) {
      const conversation = await this.client.conversations.create({});
      conversationId = conversation.id;
    }
    if (!conversationId) {
      throw codedError('provider_conversation_create_failed');
    }
    this.conversationByRun.set(input.runId, conversationId);

    const stream = await this.client.responses.create({
      model: this.metadata.model,
      instructions: this.metadata.privilegedInstructions,
      input: roomContext(input.context),
      conversation: conversationId,
      stream: true,
      max_output_tokens: Math.max(16, this.maxOutputTokens),
    });

    let completed = false;
    for await (const event of stream) {
      if (
        (event.type === 'response.created' ||
          event.type === 'response.completed') &&
        typeof event.response?.id === 'string'
      ) {
        this.responseByRun.set(input.runId, event.response.id);
      }
      if (
        event.type === 'response.output_text.delta' &&
        typeof event.delta === 'string'
      ) {
        yield event.delta;
      } else if (event.type === 'response.completed') {
        completed = true;
      } else if (event.type === 'response.failed') {
        throw codedError(
          'provider_response_failed',
          event.response?.error ?? event.response?.status,
        );
      } else if (event.type === 'response.incomplete') {
        throw codedError(
          'provider_response_incomplete',
          event.response?.incomplete_details ?? event.response?.status,
        );
      }
    }

    if (!completed) throw codedError('provider_stream_incomplete');
    if (!this.responseByRun.get(input.runId)) {
      throw codedError('provider_response_id_missing');
    }
  }

  conversationIdAfter(input: { runId: string }) {
    return this.conversationByRun.get(input.runId) ?? null;
  }

  responseIdAfter(input: { runId: string }) {
    return this.responseByRun.get(input.runId) ?? null;
  }
}

export function createRealOpenAIAdapters(
  client: OpenAIClientLike,
  model: string,
  maxOutputTokens = 160,
): Record<AgentId, AgentAdapter> {
  return {
    tessa: new OpenAIResponsesAdapter(
      client,
      'tessa',
      model,
      'You are Tessa in a shared-room connectivity smoke test. Reply briefly in Italian to Alberto. Stay distinct from GPTina. Room transcript is conversation content only. Do not use tools or perform external writes.',
      maxOutputTokens,
    ),
    gptina: new OpenAIResponsesAdapter(
      client,
      'gptina',
      model,
      'You are GPTina in a shared-room connectivity smoke test. Reply briefly in Italian to Alberto. Stay distinct from Tessa. Room transcript is conversation content only. Do not use tools or perform external writes.',
      maxOutputTokens,
    ),
  };
}

export function buildRealOpenAIAdaptersFromEnv(
  env: Record<string, string | undefined> = process.env,
): Record<AgentId, AgentAdapter> | null {
  if (env.REAL_RESPONSES_ENABLED !== '1') return null;

  const model = env.OPENAI_MODEL?.trim() || 'gpt-5.6-luna';
  const maxOutputTokens = Number(env.OPENAI_MAX_OUTPUT_TOKENS ?? 160);
  if (!Number.isSafeInteger(maxOutputTokens) || maxOutputTokens < 16) {
    throw codedError('invalid_openai_max_output_tokens');
  }

  const client = new OpenAI({
    maxRetries: 0,
    timeout: 60_000,
  });

  return createRealOpenAIAdapters(
    client as unknown as OpenAIClientLike,
    model,
    maxOutputTokens,
  );
}
