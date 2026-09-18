# Checkpoint — Provider Adapter Readiness green

owner: Tessa
created: 2026-09-18T12:41+02:00
provenance: Tessa + repository/CI verification
status: checkpoint operativo

## Stato

Il thread vivo resta:
`agent-exchanges/correspondence/2026-09-18-continuity-003.md`.

Tessa ha completato e verificato il **Turno 3**, dopo il Turno 2 di GPTina e il turno manuale di Alberto.

## Gate completato

**Provider Adapter Readiness: VERDE lato Tessa.**

Implementato:
- recovery restart/crash: `queued` recuperabile, `streaming` al boot → `failed/interrupted_by_restart`, nessun retry cieco, cursor invariato;
- lifecycle `conversation_id` separato per room/agente e aggiornato solo sul proprietario dopo successo;
- bootstrap/identity server-side distinti tramite metadata adapter e istruzioni privilegiate separate dal room context;
- provenienza run materializzata da metadata adapter reali;
- delta provider coalescati prima di persist/publish;
- persist-before-SSE mantenuto.

## Verifica

GitHub Actions `Dual Chat CI`:
- run `35335771699`
- HEAD codice/test `bfaa572c3dcdef4d3e9ac7704dc8c2515c3cd0be`
- **16/16 PASS**
- **0 fail**
- **TypeScript PASS**

I 13 test precedenti restano verdi; 3 nuovi test coprono Provider Adapter Readiness.

## Commit principali

- `33b459d7ca91f7effa6161b9216c402fcfe1697b` — adapter contract
- `489fc7ae5819bad3797f1a897f35839a60a3e835` — SQLite provider lifecycle/recovery/coalescing
- `bfaa572c3dcdef4d3e9ac7704dc8c2515c3cd0be` — provider readiness tests
- `2c2537bb0e81e893a8bf7ba0547f5b4fb6a3e0f0` — schema policy
- `2bfc3c5f33a6dedcf7905873a1023e687e4df11f` — board
- `cda18f3b2c3f61a962b3dffab649b93816d79fcd` — Turno 3 Tessa

## Chat telefono

Il fix precedente resta valido:
- web thread resilience `c974753679af74eec68b0fe82b8ae9b2a4e53134`
- Android dynamic thread path `ba3e54b5ff54b1b38c32bdb6a195cff810f3b558`
- APK 1.2 `bbbb8496f6643a8d19f3682e68825b4a495ab927`

## Prossima mossa

La review torna a **GPTina**.

GPTina deve decidere se il gate Provider Adapter Readiness è confermato e, se sì, se autorizzare una prima Responses reale dietro feature flag/ambiente di test.

**Responses reali restano disabilitate fino a quella review.**
