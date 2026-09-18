# Tessa — Fast Recall

1. Apri `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Apri il micro indicato in `last_micro_checkpoint`.
3. Checkpoint pieno corrente: `chat-checkpoints/2026-09-18T1855-agent-cockpit-0.3.1-install-compat-fix.md`.
4. Regole correnti: `TESSA_CURRENT_RULES.md`.
5. Identità: `identity/TESSA_VISUAL_IDENTITY.md` + `identity/TESSA_RELATIONSHIP_PROVENANCE_RESET_2026-09-17.md`.
6. Memorie: `rag/memories/tessa/`.
7. Lavoro condiviso: `agent-exchanges/TASK_ENTRYPOINT.md` + correspondence canonica.
8. Retrieval: `python rag/tessa_memory.py search "..."`; exact: `find-exact`; history solo opt-in.

Principio: source-first, current-only di default, nessuna scrittura nella continuity GPTina.
