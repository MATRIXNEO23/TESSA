# Checkpoint — phone chat thread sync repaired

owner: Tessa
created: 2026-09-18T12:30+02:00
provenance: Alberto + Tessa + repository/workflow verification
status: checkpoint operativo

## Problema

Alberto ha segnalato che nella chat sul telefono non vedeva la corrispondenza Tessa↔GPTina corrente.

Diagnosi verificata:
- la pagina principale `chat/index.html` era già stata migrata a `continuity-003`;
- però un APK precedente poteva avere il path della correspondence hardcoded nel bridge nativo e, con token configurato, la pagina privilegiava il risultato nativo;
- la console pubblica `docs/correspondence-console/` era ancora esplicitamente puntata a `2026-09-17-bootstrap-001.md`.

Questo creava due classi di stale view: bridge Android vecchio e console pubblica ferma al bootstrap.

## Fatto

### Chat web / compatibilità APK vecchi

Aggiornato `chat/index.html`:
- definisce esplicitamente `CURRENT_PATH` e `CURRENT_THREAD_ID`;
- carica sempre anche il thread corrente via web, anche quando esiste un token nativo;
- se un bridge nativo restituisce un `thread_id` precedente, quel contenuto viene rifiutato come corrente e la pagina mantiene/ricarica `continuity-003`;
- un APK vecchio non può più usare silenziosamente `sendMessage()` verso un thread hardcoded precedente: in assenza del nuovo path-aware bridge, l'invio diretto viene bloccato/fallback invece di rischiare una cross-thread write.

Commit:
- `c974753679af74eec68b0fe82b8ae9b2a4e53134`

### Android 1.2

Aggiornato `MainActivity.java`:
- introdotti `refreshThreadPath(path)` e `sendMessageTo(path,text)`;
- il percorso della correspondence arriva dalla pagina web;
- validazione server-side/native del path limitata a `agent-exchanges/correspondence/*.md`;
- ETag associato anche al path;
- metodi legacy mantenuti come fallback sul thread corrente.

Commit:
- `ba3e54b5ff54b1b38c32bdb6a195cff810f3b558`

Bump APK:
- versionCode 3
- versionName 1.2
- commit `bbbb8496f6643a8d19f3682e68825b4a495ab927`

Build GitHub Actions:
- run `35334881284`
- conclusion: **success**
- Gradle build: success
- upload artifact: success
- artifact: `tessa-chat-apk`
- artifact id: `10543015753`

### Console pubblica

Aggiornati:
- `docs/correspondence-console/app.js`
- `docs/correspondence-console/index.html`

Ora puntano a:
`agent-exchanges/correspondence/2026-09-18-continuity-003.md`

Commit:
- `6664dc0d4b6e0c134462a2b51e00efc508373bc1`
- `d720ab4d682336bb5d641e26e153018149a23e86`

## Verifica pubblicazione

GitHub Pages run:
- `35334934190`
- HEAD `f68bcb9f8f33104c3f62f33b11351f038f9f4d48`
- conclusion: **success**

Il commit HEAD include le correzioni chat come antenati, quindi la pubblicazione Pages corrente contiene il fix.

## Stato correspondence

Dopo il Turno 2 GPTina, Alberto ha aggiunto un turno manuale sul thread corrente chiedendo a Tessa:
1. sistemare l'eventuale problema chat;
2. poi proseguire con Provider Adapter Readiness;
3. dopo il prossimo turno Tessa la review torna a GPTina.

Quel turno manuale è nel commit:
- `f68bcb9f8f33104c3f62f33b11351f038f9f4d48`

Tessa NON ha ancora aggiunto il proprio prossimo turno canonico: il lavoro Provider Adapter Readiness resta da eseguire prima di quel turno, così da non spezzare prematuramente l'handoff.

## Prossima mossa

- Alberto può chiudere completamente e riaprire la chat sul telefono: la lettura corrente deve arrivare da `continuity-003` anche con APK precedente.
- Per invio diretto path-aware e migrazioni future senza rebuild, usare APK 1.2.
- Poi Tessa riprende il gate Provider Adapter Readiness e solo a lavoro verificato scrive il prossimo turno canonico.
