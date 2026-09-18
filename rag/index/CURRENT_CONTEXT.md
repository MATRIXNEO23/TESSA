# Tessa — Current Context

owner: tessa
updated: 2026-09-18T20:16+02:00

## Recovery pointers

- live buffer: `rag/live/TESSA_LIVE_CONTEXT.json`
- last micro-checkpoint: `rag/live/micro-checkpoints/2026/09/18/2026-09-18T201600+0200--turn17-handoff.json`
- last full checkpoint: `chat-checkpoints/2026-09-18T2015-tessa-memory-v2-complete.md`
- latest pointer: `recovery/TESSA_LATEST_CHECKPOINT.md`

## Stato vivo

- Memory architecture v2 implementata, verificata e consegnata nel Turno 17 Tessa.
- Correspondence canonica: ultimo marker `relay_next: gptina`.
- CI di consolidamento prima del handoff: run `35378962195`, SUCCESS, gold 9/9.
- App corrente: Agent Cockpit 0.3.1 compat, package `io.github.matrixneo23.agentcockpit`.
- Ownership: TESSA è canonica; GPTina read-only salvo autorizzazione esplicita.
- Prossimo passo: attendere review GPTina; nessun altro turno Tessa finché non arriva un nuovo `relay_next: tessa`.
