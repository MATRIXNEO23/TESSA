# Persistent Android signing

Updates Android possono essere installati sopra la versione precedente solo se mantengono lo stesso `applicationId` e lo stesso certificato di firma.

## Regola

La chiave privata non va salvata nella repository pubblica.

Il workflow `.github/workflows/build-md-companion-apk.yml` usa questi GitHub Actions Secrets:

- `ANDROID_SIGNING_KEY_BASE64`
- `ANDROID_SIGNING_STORE_PASSWORD`
- `ANDROID_SIGNING_KEY_ALIAS`
- `ANDROID_SIGNING_KEY_PASSWORD`

Il primo contiene il file JKS completo codificato base64.

Quando i quattro valori sono presenti, Gradle produce:

`app/build/outputs/apk/release/app-release.apk`

firmato sempre con la stessa chiave.

Senza i secret, la CI produce soltanto `app-release-unsigned.apk`; quell'artefatto non è destinato all'installazione finale.

## Backup

Conservare offline una copia del JKS e delle relative credenziali. Se la chiave viene persa, Android non consentirà di aggiornare l'app già installata con una nuova chiave: sarà necessario disinstallarla.

Non condividere il JKS né le password e non inserirli in issue, commit o log.
