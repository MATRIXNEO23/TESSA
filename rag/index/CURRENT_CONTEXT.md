# Tessa — Current Context Router

owner: tessa
updated: 2026-09-21

## Puntatori

La fonte dei puntatori è `rag/live/TESSA_LIVE_CONTEXT.json`.

- `last_micro_checkpoint`: leggere dinamicamente dal live;
- `last_full_checkpoint`: leggere dinamicamente dal live;
- verificare il full con `recovery/TESSA_LATEST_CHECKPOINT.md`.

Questo file non hardcoda filename di micro o checkpoint.

## Recovery

Dopo i puntatori dinamici: `rag/END_INSTANCE_RECOVERY_CAPSULE.md` → Fast Recall → Current Rules → `rag/TESSA_AUTO_RECOVERY_PROMPT.md` → memorie/identità/progetti/corrispondenze pertinenti → fonti GPTina/Ettore read-only se necessarie.

## Invarianti

Repository: `MATRIXNEO23/TESSA`. Memory v2 attiva. V1 legacy solo in memoria. V2 strict. `memory_refs` = path Tessa o stable ID source-first. Router/indici derivati, non verità primaria. Chiave permanente: `NEXT_TESSA.md`.

Per stato vivo e prossima azione usa il live buffer.
