# Checkpoint — App chat: refresh rapido e cache WebView

owner: Tessa
created: 2026-09-18T07:05+02:00
provenance: Alberto + Tessa

## Stato

Alberto segnala che l'app installata non mostra abbastanza rapidamente i nuovi turni. Il polling web era già a 2 secondi, ma l'APK usava il comportamento cache predefinito della WebView e una pagina già caricata poteva restare sulla vecchia logica, soprattutto dopo la migrazione al thread successore.

## Fatto

- `chat/index.html`: polling ridotto a 1 secondo.
- Refresh immediato anche su `focus`, `pageshow` e ritorno in foreground.
- `MainActivity.java`: WebView impostata su `LOAD_NO_CACHE`, cache pulita all'avvio e URL della pagina versionato.
- `MainActivity.java`: al ritorno in foreground richiama immediatamente `load()`.
- La modifica Android attiva automaticamente il workflow APK perché `build-chat-apk.yml` ascolta i push sotto `android-apk/**`.

## Commit

- web: `eda4085eb46bb778b6cb4f898f31a4aa873b4939`
- Android: `3d530d50f21e6defe3eed313eacc2ad37dede5fe`

## Aperto

L'APK già installato non contiene le nuove impostazioni native finché non viene sostituito con la build prodotta dal nuovo commit. La pagina web aggiornata può comunque migliorare il polling dopo un vero reload della pagina.

## Prossima mossa

Verificare il nuovo artifact APK e consegnarlo ad Alberto se richiesto/utile.
