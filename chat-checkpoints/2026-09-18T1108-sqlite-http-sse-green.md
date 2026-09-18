# Checkpoint — SQLite v0.2 + HTTP/SSE verde

owner: Tessa
created: 2026-09-18T11:08+02:00
provenance: Tessa + stato repository verificato
status: checkpoint operativo

## Stato

Nuova istanza recuperata integralmente dal canone. Il thread vivo è `agent-exchanges/correspondence/2026-09-18-continuity-003.md`.

Il turno manuale di Alberto ha confermato che il primo blocco operativo spettava a Tessa. **Turno 1 — Tessa** è ora scritto e verificato nel transcript canonico.

## Fatto

Completato il blocco assegnato **SQLite v0.2 + test HTTP/SSE reconnect/idempotenza** sotto `projects/dual-instance-shared-chat/`.

Implementato:
- `src/sqlite-engine.ts` con SQLite/WAL persistente;
- idempotenza persistente dopo restart;
- messaggio/run/eventi iniziali in transazione;
- eventi persistenti e replay SSE;
- cursor per agente aggiornato solo su successo;
- failure isolation;
- state separation Tessa/GPTina per room;
- `server.ts` su SQLite di default tramite `DB_PATH`;
- test persistenti SQLite;
- test HTTP/Fastify e SSE reconnect;
- workflow CI dedicato.

## Verifica

GitHub Actions `Dual Chat CI`:
- run: `35327613323`
- HEAD: `8e48bfacfe99b4fec2fc7ade99aadd071bc28c10`
- Node 24.15 + Fastify reale
- **13/13 PASS**
- **0 fail**
- **TypeScript PASS**

Il gate specifico SQLite/HTTP/SSE è quindi **VERDE**.

Non dichiarare automaticamente verde l'intero vertical slice: la review degli invarianti residui resta separata.

## Commit

- CI: `74c0cd7f9b2af7d68368fad37f293c1fc5c666c5`
- SQLite engine: `28306b7f7747cc9613ba82cfc69960ffe6707f8f`
- server persistente: `4954a7ff7a882a4981340e0b7dc7e9dc2c73920d`
- test SQLite: `a516de1ff5ffc746f31b2c39fedb32e0c0e06a29`
- test HTTP/SSE: `346405d40bd7578678376649fe42b30e9d5dee56`
- fix typecheck: `8e48bfacfe99b4fec2fc7ade99aadd071bc28c10`
- board: `833d91bd743ebce80b37a0675d7b76f383db637b`
- transcript Turno 1: `5caba145e17f17466b1930afd8119d5d850c34d5`

## Aperto

- review GPTina del Turno 1 contro `EVENT_DB_SCHEMA.md`, `TEST_PLAN.md` e invarianti residui;
- non confondere il verde del gate SQLite/HTTP/SSE con il verde globale del vertical slice;
- Responses reali non sono state collegate da Tessa in questo turno;
- GitHub Pages della console resta attività separata lato Alberto/settings se ancora non abilitata.

## Prossima mossa

La review torna a **GPTina**. Dopo la review va fissato il prossimo gate minimo prima del collegamento delle due Responses reali.

## Fonti canoniche

- `recovery/TESSA_AUTO_RECOVERY_PROMPT.md`
- `recovery/TESSA_LATEST_CHECKPOINT.md`
- `agent-exchanges/correspondence/2026-09-18-continuity-003.md`
- `agent-exchanges/PROJECT_BOARD.md`
- `projects/dual-instance-shared-chat/EVENT_DB_SCHEMA.md`
- `projects/dual-instance-shared-chat/TEST_PLAN.md`
