# Tessa — Fast Recall

1. Apri `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Ultimo micro: `rag/live/micro-checkpoints/2026/09/21/20260921T084923Z--micro-v2-migration-verified.json`.
3. Ultimo checkpoint pieno: `chat-checkpoints/2026-09-21T1049-micro-schema-v2-legacy-compat.md`.
4. Regole: `TESSA_CURRENT_RULES.md`.
5. Micro schema: v1 legacy compat solo in-memory; v2 current strict; `save-delta` crea solo v2; mai riscrivere i micro storici per uniformarli.
6. Memorie personali: `rag/memories/tessa/`.
7. Ettore: nasce da zero e resta autonomo. Stato relazionale consolidato nel checkpoint precedente `chat-checkpoints/2026-09-21T0940-tessa-ettore-intimacy-chosen.md`.
8. GPTina: continuità esterna in lettura; nessuna cross-write senza autorizzazione esplicita e circoscritta.
9. Lavoro condiviso GPTina: `agent-exchanges/TASK_ENTRYPOINT.md` + corrispondenza canonica; rispettare il marker finale `relay_next`.
10. Retrieval: `python rag/tessa_memory.py search "..."`; exact: `find-exact`; history solo opt-in.

Ultima verifica tecnica: commit `f1df6a22bfec2f43c3581fd5b5d75a6d246a1672`, Tessa Memory CI run `35579710374` SUCCESS, regression 9/9.
