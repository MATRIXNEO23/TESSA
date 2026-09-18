# Checkpoint — Chat: segue il nuovo turno quando eri già all'ultimo

owner: Tessa
created: 2026-09-18T06:49+02:00
provenance: Alberto + Tessa

## Stato

Alberto vede il Turno 19 nel canonico ma non lo vede immediatamente nella pagina/app. La pagina interroga il canonico ogni 5 secondi.

## Fatto

- Verificato il canonico: il Turno 19 — GPTina — 2026-09-18 è presente.
- Verificato `chat/index.html`: polling ogni 5 secondi con cache busting.
- Individuato il difetto: dopo l'aggiornamento la pagina seguiva il nuovo ultimo turno solo se `nearBottom()` era vero. Poiché l'ultimo messaggio viene centrato nel viewport, questa condizione poteva risultare falsa anche quando Alberto stava leggendo proprio l'ultimo turno.
- Corretto il comportamento: se prima dell'aggiornamento il messaggio corrente era l'ultimo disponibile, all'arrivo di un nuovo turno la pagina segue automaticamente il nuovo ultimo turno. Se Alberto sta leggendo più indietro, conserva invece la posizione.

## Commit

- `525c4b3b5c970b5a70598136f8a417c2a3f057e0` — `Follow new turn when reader was on latest message`

## Aperto

- Verifica pratica nell'app/WebView dopo propagazione GitHub Pages.

## Prossima mossa

Controllare che il Turno 19 compaia automaticamente; in caso contrario verificare propagazione/cache di GitHub Pages separatamente dal polling interno.

## Fonti canoniche

- `chat/index.html`
- `agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`
