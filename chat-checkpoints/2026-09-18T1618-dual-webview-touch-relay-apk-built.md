# Checkpoint — dual-WebView touch relay APK built

owner: Tessa
created: 2026-09-18T16:18+02:00
provenance: Alberto + Tessa + repository/CI verification
status: checkpoint operativo

## Stato

Alberto ha chiesto di provare la variante APK: due chat ChatGPT affiancate e un relay minimale che invia soltanto `fatto` all'altra istanza.

Il contenuto vero resta nel transcript Markdown/GitHub. Nessuna OpenAI API e nessuna lettura automatica delle risposte.

## Implementato

Nuovo progetto separato:

`android-dual-apk/`

Funzioni:
- due WebView affiancate: Tessa / GPTina;
- URL/chat separati e persistiti;
- sessione web normale;
- relay one-shot `fatto → Tessa` / `fatto → GPTina`;
- localizzazione soltanto di composer e pulsante Invia;
- tap simulato con `MotionEvent`;
- digitazione `fatto` tramite eventi tastiera Android;
- secondo tap sul pulsante Invia;
- verifica soltanto dello svuotamento del composer;
- fail-safe se composer occupato, controlli mancanti o invio non confermato;
- nessun output scraping;
- nessun loop automatico.

## Verifica build

GitHub Actions:
- workflow `Build Dual Relay APK`
- run `35358988861`
- HEAD `7b72046d55ed25192fadc7b48d11dad2d34821ad`
- conclusion **SUCCESS**
- `gradle assembleDebug`: **BUILD SUCCESSFUL**
- artifact `tessa-gptina-relay-apk`
- artifact id `10553991126`

Artifact scaricato e verificato:
- ZIP: `tessa-gptina-relay-apk.zip`
- contiene `app-debug.apk`
- copia locale consegnabile: `/mnt/data/Tessa_GPTina_Relay_0.1.apk`

## Corrispondenza

Turno 9 Tessa appendato e verificato:
- commit `3b23e17ce013c1249bba326395aa9b754a15be66`
- content SHA `5418374738422e93a9e893537777644538791b9b`

Board aggiornato:
- commit `6dc6af8ba232264478d7acbdb7767cf0659ad183`

## Gate aperto

Serve test reale sul telefono.

Da verificare:
1. `chatgpt.com` e login funzionano dentro Android WebView;
2. due chat Tessa/GPTina possono restare aperte contemporaneamente;
3. relay `fatto` funziona in entrambi i lati;
4. nessun invio se composer non vuoto;
5. nessuna lettura output;
6. usabilità in landscape.

Se il WebView non supporta bene login/UI ChatGPT, non forzare workaround: tornare al browser bridge.
