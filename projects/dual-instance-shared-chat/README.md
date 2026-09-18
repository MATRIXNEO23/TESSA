# Dual-Instance Shared Chat

Progetto corrente Alberto / Tessa / GPTina.

## Baseline attiva

Una sola implementazione applicativa è attiva:

`projects/dual-instance-shared-chat/md-companion-android/`

Il canale macchina-macchina è il transcript Markdown/GitHub. ChatGPT non viene usato tramite OpenAI API e l'app non legge automaticamente le risposte.

Protocollo di turno:

- ogni turno agente termina con l'ultimo marker append-only `relay_next`;
- il companion legge soltanto l'ultimo marker;
- mostra a chi tocca;
- il pulsante `Copia fatto` mette `fatto` negli appunti;
- incolla + Invio restano manuali.

## UI companion corrente

Versione `0.3-browser`.

Schermo intero con due pannelli verticali:

- **sopra — Web / Agente**: unica barra indirizzo, default ChatGPT, navigazione HTTPS e piccolo tasto Google;
- **sotto — GPT**: nessuna barra indirizzo, apertura diretta di ChatGPT e persistenza dell'ultima conversation ChatGPT visitata.

Il tasto Indietro usa la cronologia della WebView focalizzata; quando sta per uscire dall'app chiede conferma.

## Sicurezza operativa

L'app non:
- usa OpenAI API;
- ispeziona il DOM ChatGPT;
- estrae output;
- simula tap/tastiera;
- preme Invio automaticamente.

La firma Android persistente è supportata tramite GitHub Actions Secrets. La chiave privata non è salvata nella repository pubblica.

## Web reader

La web UI Tessa↔GPTina conservata è:

`chat/index.html`

Legge il thread Markdown canonico corrente. La web reader Alberto↔GPTina vive separatamente nella repo GPTina e non è modificata da questo progetto.

## Albero storico

Le precedenti implementazioni browser bridge, touch-relay, APK legacy e backend Node/Fastify/SQLite sono state rimosse dall'albero corrente. Restano recuperabili nella history Git.
