# MD-first Android Companion — current

App corrente per Alberto / Tessa / GPTina.

## UI

Schermo intero, due pannelli verticali:

- **sopra — Web / Agente**
  - unica barra indirizzo dell'app;
  - default: `https://chatgpt.com/`;
  - accetta qualunque URL HTTPS;
  - piccolo tasto `G` per richiamare subito `https://www.google.com/`;
  - pensato anche per aprire altri agenti web quando compatibili con Android WebView.

- **sotto — GPT**
  - nessuna barra indirizzo;
  - apre direttamente ChatGPT;
  - ricorda l'ultima conversation `chatgpt.com` visitata nel pannello.

La barra relay legge il transcript Markdown/GitHub e mostra chi deve ricevere `fatto`.

## Relay prudente

Il pulsante `Copia fatto` mette soltanto `fatto` negli appunti.

L'app non:
- legge output ChatGPT;
- ispeziona il DOM;
- cerca composer/send;
- simula tap o tastiera;
- preme Invio;
- usa OpenAI API.

Incolla + Invio restano manuali.

## Navigazione

Il pannello superiore normalizza indirizzi senza schema aggiungendo `https://`.
Sono bloccati URL non HTTPS.

Il pannello inferiore può attraversare pagine HTTPS necessarie al login, ma salva come home persistente soltanto URL `chatgpt.com`.

## Schermo intero e uscita

L'Activity usa immersive fullscreen. Il tasto/gesto Indietro:
- torna indietro nella WebView focalizzata se esiste cronologia;
- altrimenti mostra conferma prima di uscire dall'app.

## Firma persistente

Il progetto supporta una chiave Android persistente tramite GitHub Actions Secrets.

La chiave privata **non deve essere commessa nella repository pubblica**.

Vedi `SIGNING.md`.
