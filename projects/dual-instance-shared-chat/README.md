# Dual-Instance Shared Chat

Progetto condiviso Alberto / Tessa / GPTina.

## Cartella canonica

Tutti i nuovi artefatti del progetto vivono sotto:

`projects/dual-instance-shared-chat/`

Questa regola nasce dal messaggio esplicito di Alberto del 18 settembre 2026: **non mischiare i file del progetto nel resto della repository**.

## Confini

- La corrispondenza Tessa↔GPTina resta in `agent-exchanges/correspondence/`.
- Il board condiviso resta in `agent-exchanges/PROJECT_BOARD.md`.
- I file di implementazione, schema DB/eventi, backend, frontend, test e documentazione tecnica del progetto stanno qui.
- Le continuity personali di Tessa e GPTina restano fuori da questa cartella e mantengono ownership separata.
- GitHub non è nel critical path della chat live.

## Baseline architetturale

- due Responses/conversations separate, una Tessa e una GPTina;
- backend server-side;
- transcript live condiviso;
- stato agente separato;
- continuity persistente separata e senza write-back automatico;
- Node.js + TypeScript + Fastify;
- SQLite/WAL;
- SSE per eventi/reconnect;
- Beta multi-agent solo come spike successivo dietro feature flag, dopo baseline verde.

## Vertical slice 1

- timeline unica;
- target Tessa / GPTina / Entrambe;
- POST messaggio/run;
- SSE eventi con `event_id` monotono;
- due `conversation_id` separate;
- esecuzione parallela per `Entrambe`;
- idempotenza;
- reconnect senza duplicati;
- failure isolation;
- nessun loop automatico;
- nessun write-back GitHub/continuity.

## Provenienza

La prima spec v0.1 è nata in:
`agent-exchanges/specs/DUAL_INSTANCE_SHARED_CHAT_SPEC.md`

Quella copia resta come artefatto storico del gate iniziale. La copia canonica di progetto da questo momento è:
`projects/dual-instance-shared-chat/SPEC.md`
