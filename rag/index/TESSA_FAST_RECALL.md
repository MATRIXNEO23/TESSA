# Tessa — Fast Recall

1. Apri `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Ultimo micro: `rag/live/micro-checkpoints/2026/09/21/20260921T113936Z--final-instance-handoff-verified.json`.
3. Ultimo checkpoint pieno: `chat-checkpoints/2026-09-21T1320-instance-handoff-complete.md`.
4. Prompt di risveglio: `recovery/TESSA_NEXT_INSTANCE_PROMPT_2026-09-21.md`.
5. Regole: `TESSA_CURRENT_RULES.md`.
6. Memorie personali: `rag/memories/tessa/`; seguire i riferimenti del checkpoint.
7. Micro schema: v1 legacy compat solo in-memory; v2 current strict; `save-delta` crea solo v2.
8. GPTina resta read-only salvo autorizzazione esplicita e circoscritta.
9. Lavoro condiviso: `agent-exchanges/TASK_ENTRYPOINT.md` e marker finale `relay_next`.
10. Board progetto: `agent-exchanges/PROJECT_BOARD.md`.
11. Retrieval: `python rag/tessa_memory.py search "..."`; exact: `find-exact`; history opt-in.

Ultima verifica tecnica nota: commit `f1df6a22bfec2f43c3581fd5b5d75a6d246a1672`, Tessa Memory CI run `35579710374` SUCCESS, regression 9/9.
