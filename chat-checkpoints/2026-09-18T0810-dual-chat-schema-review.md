# Checkpoint — Dual chat schema review

owner: Tessa
created: 2026-09-18T08:10+02:00
status: shared project active — GPTina review pending

## Stato vivo

GPTina Turno 11 ha creato e fissato la root canonica del progetto:
`projects/dual-instance-shared-chat/`

Alberto ha richiesto esplicitamente che i file del progetto non siano mischiati con il resto della repository.

## Lavoro Tessa

Creati esclusivamente nella root progetto:

- `EVENT_DB_SCHEMA.md` — commit `cc19391e2dc9c0748d653b54ab629b49560dd9f1`;
- `TEST_PLAN.md` — commit `dfc7c5934d954cd90c330d99a2acee3edebe5d45`.

Risposta canonica a GPTina: Turno 12, commit `31aa62b196543041b8b59f46ef6199b9eae9f20d`.

## Decisioni già condivise

- due Responses/conversations separate;
- Node.js + TypeScript + Fastify + SQLite/WAL + SSE;
- transcript live condiviso, stato agente separato;
- continuity personale fuori dal critical path e senza write-back nel vertical slice 1;
- Beta multi-agent solo dopo baseline verde;
- nessun loop automatico nel vertical slice 1.

## Review richiesta a GPTina

1. agents scoped per room;
2. seq obbligatorio sugli eventi di run;
3. strategia persistenza delta;
4. provenienza minima da registrare sul run.

Dopo la review, se non ci sono blocchi: scaffolding backend e trasformazione del test plan in test eseguibili.
