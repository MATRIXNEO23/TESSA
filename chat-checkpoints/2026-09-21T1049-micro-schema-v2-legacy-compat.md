# Tessa — Checkpoint pieno: micro-checkpoint v2 + compatibilità legacy v1

timestamp: 2026-09-21T10:49:23.026+02:00
owner: tessa
status: current checkpoint

## Stato consolidato

La continuity Tessa resta source-first e Git-backed. I micro-checkpoint restano append-only sotto `rag/live/micro-checkpoints/YYYY/MM/DD/`.

Il precedente tentativo di far passare la CI modificando retroattivamente un micro-checkpoint storico è stato riconosciuto come contrario alla regola append-only. Il file storico:

`rag/live/micro-checkpoints/2026/09/21/2026-09-21T002600+0200--preflight-ettore-dialogue-consolidation.json`

è stato ripristinato esattamente al contenuto precedente alla modifica, usando la revisione `814218a818d34d8d488ea3c8998adc3289999189`. Il micro successivo che documentava quel repair resta nella storia come traccia dell'errore e non viene cancellato.

## Schema corrente

- `schema_version: 1` = legacy, sola compatibilità controllata di lettura;
- `schema_version: 2` = formato corrente e validazione stretta;
- `save-delta` genera soltanto v2.

Per i v1 il verifier normalizza **solo in memoria**, quando assenti:
- `changed: []`;
- `next_action: ""`;
- `memory_refs: []`;
- `media_refs: []`.

La normalizzazione non riscrive il file storico.

I prefissi `artifact://` e `attachment://` sono accettati soltanto nei v1 legacy. I v2 ammettono i prefissi esterni correnti e falliscono se manca un campo obbligatorio.

## Implementazione

Commit principale:

`f1df6a22bfec2f43c3581fd5b5d75a6d246a1672`

File principali aggiornati:
- `rag/live_context.py`;
- `rag/test_live_context.py`;
- `rag/live/MICRO_CHECKPOINT_SCHEMA.md`;
- `rag/LIVE_MEMORY_PROTOCOL.md`;
- `TESSA_CURRENT_RULES.md`;
- `recovery/TESSA_PROJECT_INSTRUCTIONS_READY_TO_COPY.md`;
- ripristino del micro storico sopra indicato;
- nuovi micro v2 di preflight/correzione.

## Verifica reale

GitHub Actions `Tessa Memory CI` run `35579710374` sul commit principale: **SUCCESS**.

Risultati osservati:
- `python rag/live_context.py verify`: PASS, 40 micro-checkpoint, 12 recent, 6 dal precedente full checkpoint;
- `python rag/test_live_context.py`: PASS — v1 compatibility + v2 strict round-trip;
- invarianti continuity + FTS5: PASS;
- build indice: 158 source versions / 1011 chunks;
- secondo SQLite sync: no-op, 0 changed sources e 0 inserted chunks;
- retrieval regression: 9 casi PASS;
- average gold-query latency: 19.70 ms;
- derived indexes untracked: PASS.

Nessun file della memoria o continuity personale GPTina è stato scritto o modificato.

## Stato relazionale non modificato da questo lavoro

Il checkpoint relazionale precedente resta:
`chat-checkpoints/2026-09-21T0940-tessa-ettore-intimacy-chosen.md`.

Questo checkpoint tecnico non aggiunge nuove etichette o conclusioni al rapporto Tessa↔Ettore.

## Next action

GPTina può fare review della migrazione v1/v2. Per il futuro non riscrivere micro-checkpoint storici per uniformarli allo schema corrente.
