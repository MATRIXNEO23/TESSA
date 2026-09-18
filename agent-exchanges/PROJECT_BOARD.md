# PROJECT BOARD — Tessa ↔ GPTina

updated: 2026-09-18
status: current-only board

## Baseline corrente

**MD-first human-mediated relay**.

Canale macchina-macchina:
- transcript Markdown/GitHub canonico;
- ultimo marker append-only `relay_next` decide a chi tocca.

Interazione ChatGPT:
- nessuna OpenAI API;
- nessuna estrazione automatica delle risposte;
- nessuna ispezione DOM;
- nessun tap/tastiera/Invio sintetico;
- `fatto` viene copiato negli appunti;
- incolla + Invio restano manuali ad Alberto.

## App corrente

Path:

`projects/dual-instance-shared-chat/md-companion-android/`

Versione in lavorazione:

`0.3.1-compat`

UI richiesta da Alberto:
- schermo intero;
- due pannelli verticali;
- pannello superiore **Web / Agente** con unica barra indirizzo;
- default superiore: ChatGPT;
- navigazione HTTPS per usare anche altri agenti web quando compatibili;
- piccolo tasto `G` per Google home;
- pannello inferiore **GPT** senza barra indirizzo;
- pannello inferiore apre direttamente ChatGPT e ricorda l'ultima conversation ChatGPT visitata;
- conferma prima di uscire dall'app.

Relay:
- barra compatta mostra l'ultimo `relay_next`;
- pulsante `Copia fatto`;
- nessun invio automatico.

## Firma APK

Obiettivo Alberto: aggiornamenti installabili sopra la versione precedente senza disinstallazione.

Requisito tecnico:
- stessa chiave Android privata per tutte le release future.

Implementato:
- supporto Gradle per signing persistente;
- workflow GitHub Actions usa i secret:
  - `ANDROID_SIGNING_KEY_BASE64`
  - `ANDROID_SIGNING_STORE_PASSWORD`
  - `ANDROID_SIGNING_KEY_ALIAS`
  - `ANDROID_SIGNING_KEY_PASSWORD`
- materiale di firma escluso da Git;
- documentazione in `md-companion-android/SIGNING.md`.

Vincolo:
- la repo è pubblica e la chiave privata non deve essere commessa;
- il connector GitHub disponibile a Tessa non espone gestione Actions Secrets;
- prima release persistente va quindi firmata con una chiave stabile e la stessa chiave va poi configurata nei secret.

## Web reader mantenuta

Tessa↔GPTina:

`chat/index.html`

Deve continuare a leggere il thread Markdown canonico.

La web reader Alberto↔GPTina `posticino-chat/` vive nella repo GPTina ed è fuori ownership Tessa.

## Pulizia albero

Per ordine esplicito di Alberto, le implementazioni precedenti sono state eliminate dall'albero corrente:

- APK legacy `android-apk/`;
- spike touch-relay `android-dual-apk/`;
- browser bridge `unofficial-web/`;
- backend Node/Fastify/SQLite e relativi test/spec;
- workflow legacy;
- console duplicata `docs/correspondence-console/`.

Lo storico resta nella history Git.

## Gate corrente

Verificato:
- albero corrente ripulito: restano solo companion Android, `chat/index.html`, workflow corrente e infrastruttura di corrispondenza;
- ricerca branch corrente: nessun riferimento attivo a `OPENAI_API_KEY`, `api.openai.com`, browser DOM bridge, touch-relay code, Fastify/SQLite legacy;
- `chat/index.html` punta ancora a `agent-exchanges/correspondence/2026-09-18-continuity-003.md` e il thread esiste;
- companion 0.3 build run `35366429626`: unit tests PASS, guard no UI automation PASS, assembleRelease PASS, conclusion SUCCESS;
- nuova linea package stabile: `io.github.matrixneo23.agentcockpit`;
- chiave signing stabile generata fuori repo; certificato SHA256 `F8:9E:91:C1:DC:E2:39:51:EB:A6:F3:66:0B:DB:6C:98:58:B0:02:E1:55:22:DD:AE:22:77:8C:80:8C:51:1B:6B`;
- APK 0.3 firmato localmente e verificato con `jarsigner`, SHA256 `59eb9ff90c0218f79d36ac6ac8c8becb44e6bdecb8867e68c66c53084284369e`.
- Incidente installazione 0.3: APK firmato solo v1 con `jarsigner`; Android 11+ rifiuta app target API 30+ firmate solo v1. Correzione immediata 0.3.1-compat: targetSdk 29 (sideload, non Play), stessa chiave persistente, versionCode 4. Build run `35371037072`: unit tests PASS, guard PASS, assembleRelease PASS. APK locale firmato stessa chiave: `/mnt/data/Tessa_Agent_Cockpit_0.3.1_compat.apk`, SHA256 `848067f44bc26749991c247b566e39569fdc94ebaa41461b989448172af67755`.
- Fix definitivo futuro: firmare la release con schema APK v2+ tramite Gradle/Android signing una volta configurati i signing secrets; a quel punto si può riportare targetSdk alla baseline moderna.

Aperto:
1. Alberto deve conservare il backup offline della chiave signing.
2. Perché GitHub Actions firmi automaticamente le release future, configurare una volta i quattro Actions Secrets descritti in `SIGNING.md`; il connector GitHub disponibile a Tessa non espone l'API Secrets.
3. Review GPTina.
4. Test manuale sul telefono.

## Corrispondenza

Thread canonico:

`agent-exchanges/correspondence/2026-09-18-continuity-003.md`

Ultimo turno ricevuto al momento di questo board:
- Turno 14 — GPTina;
- `relay_next: tessa`.

Prossima risposta canonica: Turno 15 Tessa con cleanup + companion 0.3 + build/signing.
