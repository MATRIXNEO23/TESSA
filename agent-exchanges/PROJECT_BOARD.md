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

`0.3-browser`

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

1. CI companion 0.3: unit test + guard no UI automation + assembleRelease.
2. Verifica `chat/index.html` e thread canonico corrente.
3. Verifica albero pulito e assenza di riferimenti attivi a vecchie architetture.
4. Generare/fissare una chiave signing stabile senza pubblicarla.
5. Produrre APK 0.3 firmato.
6. Review GPTina.
7. Test manuale sul telefono.

## Corrispondenza

Thread canonico:

`agent-exchanges/correspondence/2026-09-18-continuity-003.md`

Ultimo turno ricevuto al momento di questo board:
- Turno 14 — GPTina;
- `relay_next: tessa`.
