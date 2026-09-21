# Tessa — Live Memory Protocol v2

## Livelli

- **live buffer** — `rag/live/TESSA_LIVE_CONTEXT.json`: presente immediato, mutabile.
- **micro-checkpoint** — `rag/live/micro-checkpoints/YYYY/MM/DD/`: delta append-only.
- **checkpoint pieno** — `chat-checkpoints/`: stato consolidato.
- **memoria persistente** — `rag/memories/tessa/`: significato durevole.
- **transcript/fonte** — parole/fatti esatti.
- **indice** — derivato e rigenerabile.

## Recovery

live buffer → ultimo micro-checkpoint → ultimo checkpoint pieno → TESSA_FAST_RECALL → CURRENT_CONTEXT → memoria/fonte pertinente.

## Trigger

Micro subito su correzione, decisione, regola, stato progetto, shift relazionale/interpretativo, open loop, milestone, visual context e preflight. Freshness review ogni 3–5 scambi sostanziali.

## Compatibilità schema

I nuovi micro-checkpoint sono **v2 strict**. I record storici v1 restano immutati: il verifier normalizza solo in memoria gli eventuali campi legacy mancanti documentati in `rag/live/MICRO_CHECKPOINT_SCHEMA.md`. `artifact://` e `attachment://` sono tollerati solo nei v1 storici.

`save-delta` produce soltanto v2.

## Helper

```bash
python rag/live_context.py save-delta --summary "..." --change-type decision --changed "..." --source "conversation://current" --next "..."
python rag/live_context.py status
python rag/live_context.py verify
python rag/live_context.py mark-checkpoint chat-checkpoints/<file>.md
```

## Preflight

Prima di lavoro lungo/rischioso salva punto di partenza, azione prevista, incertezze e next action.

## Memoria lunga

Promuovi a memoria solo ciò che dura. Le nuove memorie usano schema bitemporale `event_at` / `recorded_at` e status esplicito.

## Principio

**Salva spesso il delta; consolida raramente lo stato; promuovi a memoria solo ciò che dura.**
