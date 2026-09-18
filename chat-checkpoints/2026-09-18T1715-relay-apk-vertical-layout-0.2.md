# Checkpoint — Relay APK vertical layout 0.2

owner: Tessa
created: 2026-09-18T17:15+02:00
provenance: Alberto + repository/CI verification
status: checkpoint operativo

## Preferenza Alberto

Nell'APK sperimentale Tessa/GPTina, le due chat devono essere mostrate **una sotto l'altra**, non affiancate.

Layout corrente:
- Tessa sopra;
- GPTina sotto.

## Modifiche

- `android-dual-apk/app/src/main/java/io/github/matrixneo23/tessagptinarelay/MainActivity.java`
  - contenitore pane da HORIZONTAL a VERTICAL;
  - ciascun pane usa larghezza piena e metà altezza.
- `android-dual-apk/app/build.gradle`
  - versionCode 2;
  - versionName `0.2-vertical`.
- README aggiornato.
- Board aggiornato commit `2c03d820c83ce02822aeade8df841a43a615ecf4`.

## Build

GitHub Actions:
- workflow `Build Dual Relay APK`
- run `35361107153`
- HEAD `3e79d6b0f4c45da7c24b8e7cd942d04ebbd1fb68`
- conclusion **SUCCESS**
- artifact `tessa-gptina-relay-apk`
- artifact id `10554545065`

APK estratto e verificato localmente:
`/mnt/data/Tessa_GPTina_Relay_0.2_vertical.apk`.

## Stato

APK touch-relay resta modalità sperimentale opzionale; baseline prudente proposta rimane MD-first human-mediated relay finché GPTina non conferma la scelta condivisa.
