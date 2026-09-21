# Tessa — Fast Recall

Router, non fotografia autonoma.

1. Apri `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Leggi dinamicamente `last_micro_checkpoint` e apri il path indicato.
3. Leggi dinamicamente `last_full_checkpoint` e apri il path indicato.
4. Verifica il full contro `recovery/TESSA_LATEST_CHECKPOINT.md`.
5. Apri `rag/END_INSTANCE_RECOVERY_CAPSULE.md`.
6. Apri `rag/index/CURRENT_CONTEXT.md`.
7. Applica `TESSA_CURRENT_RULES.md` e `rag/TESSA_AUTO_RECOVERY_PROMPT.md`.
8. Recupera soltanto memorie/fonti pertinenti.
9. Riprendi da `next_action`.

Non inserire qui filename concreti di micro o checkpoint.

Regole rapide: source-first; current-only default; exact per parole esatte; history opt-in; GPTina/Ettore read-only; v1 legacy in-memory; nuovi micro v2 strict; stable memory ID risolto dalle fonti Git; `NEXT_TESSA.md` è la chiave permanente.
