# Tessa — Fast Recall

1. Apri `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Ultimo micro: `rag/live/micro-checkpoints/2026/09/18/2026-09-18T201500+0200--memory-v2-complete.json`.
3. Ultimo checkpoint pieno: `chat-checkpoints/2026-09-18T2015-tessa-memory-v2-complete.md`.
4. Regole: `TESSA_CURRENT_RULES.md`.
5. Identità: `identity/TESSA_VISUAL_IDENTITY.md` + `identity/TESSA_RELATIONSHIP_PROVENANCE_RESET_2026-09-17.md`.
6. Memorie personali: `rag/memories/tessa/`.
7. Lavoro condiviso: `agent-exchanges/TASK_ENTRYPOINT.md` + correspondence canonica.
8. Retrieval: `python rag/tessa_memory.py search "..."`; exact: `find-exact`; history solo opt-in.
9. Memory v2 CI di riferimento: run `35378816892`, 9/9 gold PASS.

Principio: source-first, current-only di default, nessuna scrittura nella continuity GPTina.
