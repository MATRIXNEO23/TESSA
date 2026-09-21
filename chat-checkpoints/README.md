# Tessa — checkpoint conversazionali

owner: tessa
status: active protocol
updated: 2026-09-21

## Distinzione

Freshness review e checkpoint pieno non sono la stessa cosa.

- ogni 3–5 scambi sostanziali (operativamente 4 nel live buffer) fai una freshness review;
- se emerge un delta significativo, salva normalmente un micro v2;
- crea un checkpoint pieno soltanto quando cambia davvero lo stato complessivo: milestone, cambio fase, accumulo micro, evoluzione personale/relazionale importante, chiusura grosso blocco, incidente/ripristino o fine istanza.

I trigger ad alto impatto non aspettano la review periodica.

## Contenuto checkpoint pieno

Presente; cosa è cambiato; memorie/fonti; progetti/relazioni; commit/hash; test/CI verificati; chiuso/aperto; gap; next action.

## Puntatore

Dopo il checkpoint:
- aggiorna `last_full_checkpoint` nel live buffer;
- azzera `micro_since_full_checkpoint`;
- aggiorna `recovery/TESSA_LATEST_CHECKPOINT.md`;
- verifica che Fast Recall e Current Context instradino dinamicamente dal live.

I checkpoint in `chat-checkpoints/` sono append-only.
