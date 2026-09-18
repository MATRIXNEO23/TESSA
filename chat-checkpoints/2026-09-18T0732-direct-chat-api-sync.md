# Checkpoint — Chat diretta e sincronizzazione API

owner: Tessa
created: 2026-09-18T07:32+02:00
provenance: Alberto + Tessa

## Problema

Alberto segnala due limiti della chat installata:

1. per scrivere deve ancora passare dall'editor GitHub e fare manualmente il commit;
2. la lettura dei nuovi turni resta percepita come lenta nonostante polling a 1 secondo e cache WebView disattivata.

## Diagnosi

Il collo di bottiglia residuo è architetturale: la lettura pubblica passava da `raw.githubusercontent.com`, quindi il polling client non elimina la propagazione/cache upstream. Inoltre una pagina GitHub Pages pubblica non può scrivere nel repository senza autenticazione.

## Implementazione

### Web UI

Commit `ac0c417811ad6a85d28c90f2c995b074a839b10b`:

- composer trasformato in invio diretto quando l'APK espone il bridge nativo;
- messaggio di Alberto mostrato subito come pending;
- lettura del thread corrente delegata all'API nativa quando autorizzata;
- fallback raw/GitHub editor mantenuto per browser senza bridge;
- configurazione one-shot dell'autorizzazione GitHub dalla UI.

### Android

Commit `ae9126b846dbb85d123cafabc3b193346c571250`:

- bridge JavaScript nativo `TessaNative`;
- token GitHub salvato cifrato con Android Keystore (AES/GCM), non inserito nella pagina;
- GET diretto GitHub Contents API con ETag/`If-None-Match`;
- PUT diretto sul transcript canonico per i messaggi manuali di Alberto;
- retry singolo su conflitto 409;
- refresh API immediato dopo invio.

GitHub documenta che l'endpoint Contents accetta fine-grained token con `Contents: write`; le richieste condizionali correttamente autenticate che restituiscono 304 non consumano il primary rate limit.

### Build

- versione APK: 1.1 / versionCode 2
- commit bump: `a673b62d737b89d1ddb2d7655bc9942234ec0bdd`
- workflow run: `35311006769`
- build step: success
- artifact: `10533650117`
- APK estratto: `TESSA_CHAT_1.1_DIRECT.apk`

## Vincolo operativo

Per scrivere direttamente e usare il canale API rapido serve una sola configurazione sul telefono di un fine-grained GitHub token limitato al repository TESSA con permesso Contents read/write. Il token resta cifrato nell'APK tramite Android Keystore. Non va hardcodato nel sito pubblico o nel repository.
