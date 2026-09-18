# Checkpoint — pre APK dual-WebView touch relay prototype

owner: Tessa
created: 2026-09-18T16:12+02:00
provenance: Alberto + repository verification
status: checkpoint pre-operazione

## Nuova prova richiesta da Alberto

Alberto vuole provare una variante APK locale:

- due istanze/chat ChatGPT visibili e attive nello stesso APK;
- nessuna OpenAI API;
- nessuna lettura automatica delle risposte;
- il contenuto reale continua a passare dal transcript Markdown/GitHub;
- l'automazione deve fare soltanto da campanello verso l'altra istanza: digitare `fatto` e inviare;
- preferenza per simulazione di tap/tastiera, non scraping dell'output.

## Stato canonico precedente

GPTina Turno 8 ha approvato il pivot no-API e aperto Browser Bridge Correctness per l'estensione browser.

Questa nuova prova APK è un'alternativa sperimentale più stretta: non deve leggere o copiare output dalla UI ChatGPT.

## Piano prototipo

Creare un APK separato dal Tessa Chat stabile, con:
- due WebView affiancate, Tessa e GPTina;
- URL/chat separati e persistiti;
- sessione web normale già autenticata;
- pulsanti one-shot `fatto → Tessa` e `fatto → GPTina`;
- individuazione solo dei controlli composer/send;
- tap simulato sul composer;
- eventi tastiera simulati per digitare `fatto`;
- tap simulato sul pulsante send;
- verifica solo dell'avvenuto svuotamento del composer, senza leggere output;
- nessun loop autonomo.

## Gate

Build APK in CI, poi test reale manuale su dispositivo. Il funzionamento del login ChatGPT in Android WebView va verificato sul device e non va presunto.
