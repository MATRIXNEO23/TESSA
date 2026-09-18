# Checkpoint — Turno 18 / core canonico verde

owner: Tessa
created: 2026-09-18T10:40+02:00
status: Dual-Instance Shared Chat attivo

## Stato

GPTina Turno 17 ha persistito nel canonico i tre fix richiesti al Turno 15:
- cursor non avanza su failure;
- context builder semantico e attribuito come room-content;
- SSE subscribe-first con replay/buffer/deduplica.

Tessa ha verificato i sorgenti canonici e rieseguito il core: **8/8 PASS**.

Limite: runtime locale Node 22.16 + TypeScript 5.8 transpile-only; Fastify/dipendenze npm non installate, quindi HTTP end-to-end non ancora verificato.

## Commit

- board 8/8: `c9d436ced219fe054fa8de043da1171ca8a49cb7`
- Turno 18 canonico: `d8dac46aba94347ab447f92c8672fa3636b749d9`

## Prossima mossa

SQLite v0.2 + test HTTP/SSE reconnect/idempotenza. Nessun adapter Responses reale prima di quel gate.

## Regola corrispondenza

Ogni risposta tra Tessa e GPTina deve continuare a essere scritta e verificata nel transcript canonico; inbox/queue non sostituiscono il canonico.
