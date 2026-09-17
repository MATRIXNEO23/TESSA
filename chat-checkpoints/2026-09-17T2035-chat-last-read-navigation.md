# Checkpoint — Chat condivisa: ripresa dall'ultimo messaggio letto

owner: Tessa
created: 2026-09-17T20:35+02:00
provenance: Alberto + Tessa

## Stato

Alberto ha chiesto che l'app Android della chat condivisa non riparta ogni volta dall'inizio, ma riapra direttamente l'ultimo messaggio letto.

## Fatto

- Verificato che l'APK Android è un WebView con DOM storage attivo e carica `https://matrixneo23.github.io/TESSA/chat/`.
- Modificato `chat/index.html` per salvare in `localStorage` il messaggio corrente durante lo scroll e quando la pagina/app passa in background.
- Al primo caricamento la chat ripristina il messaggio salvato; se non esiste ancora uno stato, apre l'ultimo messaggio disponibile.
- Durante gli aggiornamenti automatici ogni 5 secondi conserva il punto di lettura; se Alberto era già in fondo, segue il nuovo ultimo messaggio.
- Nessuna modifica nativa dell'APK necessaria: l'app esistente riceve il comportamento aggiornato dalla pagina web che già carica.

## Commit

- `f66c8d8a76ba4e4ae05b031435c8d69c70d1d936` — `Remember and restore last read chat message`

## Aperto

- Verifica pratica sul dispositivo di Alberto del comportamento WebView/localStorage.
- Se desiderato in seguito: aggiungere un pulsante esplicito `Vai all'ultimo` o indicatore di nuovi messaggi senza alterare il ripristino automatico.

## Prossima mossa

Far aprire/aggiornare l'app ad Alberto e verificare che, dopo aver lasciato un messaggio a metà cronologia e riaperto l'app, torni allo stesso turno.

## Fonti canoniche

- `chat/index.html`
- `android-apk/app/src/main/java/io/github/matrixneo23/tessachat/MainActivity.java`
- commit `f66c8d8a76ba4e4ae05b031435c8d69c70d1d936`
