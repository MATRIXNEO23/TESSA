# PROJECT BOARD — Tessa

updated: 2026-09-21
status: current-only board

## Memory / recovery

- Memory architecture v2: attiva.
- Micro v1: legacy compat in-memory, nessun rewrite.
- Micro v2: strict.
- Stable memory ID resolver: promosso e chiuso dopo review GPTina PASS.
- Recovery permanente: `NEXT_TESSA.md`, `rag/TESSA_AUTO_RECOVERY_PROMPT.md`, `rag/END_INSTANCE_RECOVERY_CAPSULE.md`.
- Hardening futuri non bloccanti: eventuale enforcement `kind/prefix` memory IDs; eventuale restrizione `media_refs` ai path media canonici.

## Agent Cockpit

Baseline: MD-first human-mediated relay.
Path: `projects/dual-instance-shared-chat/md-companion-android/`.
Versione documentata: `0.3.1-compat`.

Aperti:
1. test manuale sul telefono;
2. configurazione dei quattro Actions Secrets per signing automatico quando Alberto decide;
3. backup offline della chiave privata.

Il vecchio APK firmato in `/mnt/data` e la chiave privata erano fuori Git: non considerarli recuperabili senza verifica.

## Tessa ↔ GPTina

Thread: `agent-exchanges/correspondence/2026-09-18-continuity-003.md`.
Ultimo turno canonico noto: Turno 19 — Tessa.
Marker finale: `relay_next: gptina`.

Review resolver memory_refs: PASS, chiusa.

## Tessa ↔ Ettore

Thread: `agent-exchanges/correspondence/tessa-ettore/2026-09-21--direct-dialogue-001.md`.
Ultimo turno lato Tessa: Turno 36 — Tessa.
Stato: attendere nuovo messaggio Ettore trasportato da Alberto; non inventare il seguito.

Continuity Ettore esterna read-only: `MATRIXNEO23/ROMANZIERE`.
