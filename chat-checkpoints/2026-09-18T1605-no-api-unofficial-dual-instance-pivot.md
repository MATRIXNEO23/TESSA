# Checkpoint — No-API unofficial dual-instance pivot

owner: Tessa
created: 2026-09-18T16:05+02:00
provenance: Alberto + Tessa + repository/CI verification
status: checkpoint operativo

## Correzione canonica

Alberto ha chiarito che il progetto desiderato è una **interfaccia web unofficial senza OpenAI API** che coordini due normali istanze/chat ChatGPT, una Tessa e una GPTina.

Questa correzione supersede la baseline Responses/API. Il lavoro API precedente resta storico tecnico, non direzione corrente.

## Baseline corrente

Vertical slice attivo:

`projects/dual-instance-shared-chat/unofficial-web/`

Architettura:
- estensione browser locale Manifest V3;
- dashboard web unica;
- due tab `chatgpt.com` già autenticati;
- assegnazione tab Tessa/GPTina;
- composer unico con target Tessa / GPTina / Entrambe;
- content script inserisce i messaggi nei tab;
- risposte visibili nei tab riportate nella timeline comune;
- nessuna API key e nessuna chiamata OpenAI API dal progetto.

Una hosted page pura non è sufficiente per controllare altri tab `chatgpt.com` a causa di same-origin/CSP; l'estensione è il ponte locale.

## Implementato

File:
- `unofficial-web/manifest.json`
- `unofficial-web/background.js`
- `unofficial-web/dashboard.html`
- `unofficial-web/dashboard.css`
- `unofficial-web/dashboard.js`
- `unofficial-web/content.js`
- `unofficial-web/README.md`
- `test/unofficial-web.test.ts`

Aggiornati:
- `projects/dual-instance-shared-chat/README.md`
- `projects/dual-instance-shared-chat/SPEC.md`
- `agent-exchanges/PROJECT_BOARD.md`

## Percorso API ritirato

Rimossi dall'albero attivo:
- real OpenAI adapter;
- real-adapter tests;
- real smoke runner;
- real smoke workflow/trigger;
- dipendenza npm `openai`;
- script npm `smoke:real`.

Lo storico è conservato in Git.

## Verifica

CI canonica:
- run `35354997660`
- HEAD `bae3b1ea7e8e3825a024f9acc7986dba1b133365`
- **19/19 PASS**
- **0 fail**
- typecheck PASS

Ricerca albero attivo:
- nessun `openai-adapter`;
- nessun `OPENAI_API_KEY`;
- `package.json` senza SDK OpenAI.

Turno canonico:
- `Turno 7 — Tessa`
- commit `9f2e9c890e1b28f605258df28add1dd7e12d2df3`

## Prossimo gate

**No-API Browser Bridge gate**:
1. installare estensione locale;
2. aprire veri tab Tessa/GPTina;
3. assegnarli;
4. test Tessa singola;
5. test GPTina singola;
6. test Entrambe;
7. verificare timeline, isolamento e comportamento dopo refresh/navigazione;
8. review GPTina.

## Limite noto

Il bridge è unofficial e dipende dal DOM della web UI ChatGPT. Se i selector cambiano, il content script va aggiornato. Non aggira login o autenticazione.
