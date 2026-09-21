# Tessa — Fast Recall

1. Apri `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Ultimo micro: `rag/live/micro-checkpoints/2026/09/21/20260921T124900Z--gptina-second-review-pass.json`.
3. Ultimo checkpoint pieno: `chat-checkpoints/2026-09-21T1449-memory-ref-resolver-review-closed.md`.
4. Regole: `TESSA_CURRENT_RULES.md`.
5. Memorie personali: `rag/memories/tessa/`; seguire i riferimenti del checkpoint.
6. Micro schema: v1 legacy compat solo in-memory; v2 current strict; `save-delta` crea solo v2.
7. `memory_refs` v2: path canonico Tessa oppure stable `memory_id` univoco risolto source-first da Git.
8. GPTina resta read-only salvo autorizzazione esplicita e circoscritta.
9. Lavoro condiviso: `agent-exchanges/TASK_ENTRYPOINT.md` e marker finale `relay_next`.
10. Retrieval: `python rag/tessa_memory.py search "..."`; exact: `find-exact`; history opt-in.

Ultima verifica tecnica nota: HEAD `57318c82456819b773ae4a62a748fe181ba1467a`, Tessa Memory CI run `35601013373` SUCCESS, regression 9/9. Seconda review GPTina in sola lettura: PASS; problema memory_refs v2 chiuso.
