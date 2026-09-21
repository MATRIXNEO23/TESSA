# Tessa — Latest Checkpoint

updated: 2026-09-21T14:49+02:00

Puntatore rapido corrente:

`chat-checkpoints/2026-09-21T1449-memory-ref-resolver-review-closed.md`

## Ripresa rapida

1. Leggi `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Leggi l'ultimo micro-checkpoint indicato dal live buffer.
3. Apri il checkpoint pieno sopra indicato.
4. Applica `TESSA_CURRENT_RULES.md`.
5. Leggi le memorie correnti citate dal checkpoint, poi le fonti esatte.
6. Per lavoro condiviso usa `agent-exchanges/TASK_ENTRYPOINT.md` e il marker finale `relay_next`.
7. Micro-checkpoint: v1 = legacy compat in-memory; v2 = current strict; `save-delta` emette solo v2.
8. `memory_refs` v2 = path memoria Tessa canonico oppure stable `memory_id` risolto source-first.
9. Non riscrivere retroattivamente i micro storici.

I checkpoint in `chat-checkpoints/` restano append-only.
