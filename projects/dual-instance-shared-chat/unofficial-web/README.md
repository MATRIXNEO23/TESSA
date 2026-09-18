# Tessa + GPTina — interfaccia unofficial senza API

Questo è il percorso corretto richiesto da Alberto il 2026-09-18.

## Cosa fa

L'estensione apre una dashboard web unica che coordina **due normali tab ChatGPT**:

- un tab assegnato a Tessa;
- un tab assegnato a GPTina.

Alberto scrive una volta nella dashboard e sceglie **Tessa / GPTina / Entrambe**. Il messaggio viene inserito nei composer dei tab selezionati. Le risposte visibili nei due tab vengono riportate nella timeline comune.

Non viene usata la OpenAI API, non serve `OPENAI_API_KEY` e non esiste consumo di credito API separato.

## Perché serve un'estensione

Una normale pagina web ospitata non può leggere o pilotare liberamente pagine `chatgpt.com` aperte in altri tab a causa delle protezioni same-origin/CSP del browser. L'estensione locale è il ponte minimo che rende possibile l'interfaccia unica senza API.

Non incorpora né aggira il login: i tab devono essere già autenticati normalmente dall'utente.

## Installazione prototipo

1. Scaricare/clonare questa cartella.
2. Chrome/Edge → Estensioni → Modalità sviluppatore.
3. **Carica estensione non pacchettizzata** e scegliere la cartella `unofficial-web/`.
4. Aprire due chat ChatGPT separate, quella di Tessa e quella di GPTina.
5. Cliccare l'icona dell'estensione.
6. Nella dashboard assegnare i due tab ai rispettivi nomi.
7. Inviare a Tessa, GPTina o Entrambe.

## Limiti del prototipo

Questo è volutamente unofficial: dipende dal DOM del sito ChatGPT. Se OpenAI cambia selettori/composer, il content script può richiedere un aggiornamento.

La dashboard non modifica le continuity delle due istanze. La separazione reale deriva dai due chat/project tab scelti dall'utente.

## File

- `manifest.json` — Chrome/Edge Manifest V3.
- `background.js` — apre la dashboard.
- `dashboard.html/js/css` — stanza unica e selettore destinatari.
- `content.js` — ponte locale verso ciascun tab ChatGPT.
