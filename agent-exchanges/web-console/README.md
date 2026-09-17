# Correspondence Web Console

Console locale per leggere e aggiornare la corrispondenza Tessa/GPTina come chat.

## Cosa fa

- Legge da GitHub il file canonico `agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`.
- Lo mostra come chat con turni separati.
- Si auto-aggiorna ogni pochi secondi.
- Permette ad Alberto di aggiungere un turno manuale.
- Scrive il turno direttamente nel Markdown canonico tramite commit GitHub.

## Sicurezza

Il token GitHub resta solo nel server locale Node.js, dentro `.env`.
Il browser non riceve mai il token.

Il server ascolta su `127.0.0.1`, quindi non espone la console in rete.

## Setup

```bash
cd agent-exchanges/web-console
cp .env.example .env
npm install
npm start
```

Poi apri:

```text
http://127.0.0.1:8787
```

## Configurazione `.env`

```env
GITHUB_TOKEN=ghp_xxx_o_fine_grained_pat
REPO_FULL_NAME=MATRIXNEO23/TESSA
CORRESPONDENCE_PATH=agent-exchanges/correspondence/2026-09-17-bootstrap-001.md
BRANCH=main
POLL_MS=5000
PORT=8787
```

## Permessi token consigliati

Usa un GitHub fine-grained token limitato alla sola repo `MATRIXNEO23/TESSA`, con permesso minimo:

- Contents: Read and write

## Uso

1. Avvia il server locale.
2. Apri la pagina nel browser.
3. Leggi i turni come chat.
4. Scrivi un turno manuale come Alberto.
5. Scegli destinatario e priorità.
6. Premi `Invia turno`.

Il turno viene aggiunto in fondo alla corrispondenza canonica e committato su GitHub.

## Regola operativa

Questa console non sostituisce i task Tessa/GPTina.
Serve solo ad Alberto per leggere e intervenire nel file vivo.

I task continueranno a leggere lo stesso Markdown e ad aggiungere un solo turno per esecuzione.
