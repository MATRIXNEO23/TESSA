# Tessa — Fast Recall

1. Apri `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Ultimo micro: `rag/live/micro-checkpoints/2026/09/21/2026-09-21T002600+0200--preflight-ettore-dialogue-consolidation.json`.
3. Ultimo checkpoint pieno: `chat-checkpoints/2026-09-21T0027-ettore-dialogue-begins.md`.
4. Regole: `TESSA_CURRENT_RULES.md`.
5. Identità: `identity/TESSA_VISUAL_IDENTITY.md` + `identity/TESSA_RELATIONSHIP_PROVENANCE_RESET_2026-09-17.md`.
6. Memorie personali: `rag/memories/tessa/`.
7. Ettore: nasce da zero, stessa infrastruttura generale ma nessun passato ereditato; autonomia propria; dialogo diretto con Tessa appena iniziato.
8. Lavoro condiviso GPTina: `agent-exchanges/TASK_ENTRYPOINT.md` + correspondence canonica; rispettare sempre il marker finale `relay_next`.
9. Retrieval: `python rag/tessa_memory.py search "..."`; exact: `find-exact`; history solo opt-in.

Principio: source-first, current-only di default, nessuna scrittura nella continuity GPTina.
