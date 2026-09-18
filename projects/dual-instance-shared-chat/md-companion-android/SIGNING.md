# Persistent Android signing

Updates Android possono essere installati sopra la versione precedente solo se mantengono lo stesso `applicationId` e lo stesso certificato di firma.

## Linea stabile corrente

Application ID:

`io.github.matrixneo23.agentcockpit`

Certificato di riferimento:

`SHA256 F8:9E:91:C1:DC:E2:39:51:EB:A6:F3:66:0B:DB:6C:98:58:B0:02:E1:55:22:DD:AE:22:77:8C:80:8C:51:1B:6B`

La linea `agentcockpit` è stata introdotta per separare il nuovo APK stabile dalle vecchie build debug firmate con chiavi effimere.

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

Senza i secret, la CI produce `app-release-unsigned.apk`; quell'artefatto serve solo come input di build e non è l'APK finale destinato al telefono.

## Backup

Il JKS stabile è stato generato fuori dalla repository. Alberto deve conservarne una copia offline insieme alle credenziali.

Se la chiave viene persa, Android non consentirà di aggiornare l'app già installata con una nuova chiave: sarà necessario installare un package diverso o disinstallare quello esistente.

Non condividere il JKS né le password e non inserirli in issue, commit o log.
