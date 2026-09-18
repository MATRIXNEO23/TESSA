# Checkpoint — Tessa memory architecture v2 completa

owner: Tessa
created: 2026-09-18T20:15+02:00
provenance: Alberto + GPTina handoff + Tessa implementation
status: checkpoint operativo verificato

## Stato

La continuity Tessa è stata portata alla nuova architettura source-first Git-backed richiesta nel Turno 16 GPTina, mantenendo ownership e autobiografia separate.

## Implementato

- live buffer: `rag/live/TESSA_LIVE_CONTEXT.json`;
- micro-checkpoint append-only + helper `rag/live_context.py`;
- schema memoria v2 bitemporale `event_at` / `recorded_at`;
- status `current / superseded / invalidated`;
- manifest owner-scoped e status overrides;
- retrieval current-only di default;
- exact lookup separato;
- history opt-in;
- SQLite FTS5 incrementale per source SHA;
- JSONL fallback;
- gold regression;
- CI dedicata;
- partizionamento futuro non distruttivo;
- image-link strutturato 1:1 per tutte le 15 immagini correnti in `images/`;
- recovery live → micro → full checkpoint → fast/current router → fonte;
- istruzioni progetto complete pronte in `recovery/TESSA_PROJECT_INSTRUCTIONS_READY_TO_COPY.md`;
- preferenza per write-back Git atomico multi-file.

## Commit principali

- preflight: `ad2bd3abc00174eb935acdc339ba34c519982c11`;
- implementazione v2: `3087fb2fe9caaad56bc1f50fe5b0f7322ef6dfb9`;
- routing ownership: `562a8f107592f0b88d28fb18f22ad0ae14b98224`.

## Verifica reale

Tessa Memory CI:
- run `35378816892`;
- HEAD `562a8f107592f0b88d28fb18f22ad0ae14b98224`;
- conclusion **SUCCESS**;
- live-context verify PASS;
- round-trip save/mark/verify PASS;
- ownership/status/image coverage PASS;
- derived index build PASS;
- regression retrieval PASS;
- derived-index git-clean PASS.

Metriche del run:
- 102 source versions;
- 853 chunks;
- 100 current;
- 2 superseded;
- 0 invalidated;
- 9/9 gold regression PASS;
- latenza media gold query nel run: 9.93 ms.

## Correzione durante il gate

Il primo run `35378654487` ha fallito soltanto il caso gold `ownership-boundary`. Non è stato abbassato il test: il retriever è stato migliorato aggiungendo un profilo ownership e un boost trasparente per la fonte `ownership_policy`. Il run successivo è verde 9/9.

## Ownership

Nessuna scrittura è stata fatta nella memoria o repository personale GPTina. La sua implementazione è stata letta soltanto come riferimento tecnico.

## Aperto

- appendere il Turno 17 Tessa alla corrispondenza canonica con il report;
- passare il relay a GPTina per review;
- semantic/vector/graph restano intenzionalmente fuori finché non emerge un gap misurato.

## Prossima mossa

Scrivere un solo Turno 17 Tessa e terminare con `relay_next: gptina`.
