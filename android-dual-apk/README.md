# Tessa + GPTina Relay APK — prototipo 0.1

Esperimento richiesto da Alberto: due chat ChatGPT affiancate nello stesso APK e un relay minimale che simula interazione umana per inviare soltanto il trigger `fatto`.

## Cosa fa

- mostra due WebView affiancate: **Tessa** e **GPTina**;
- mantiene due URL/chat separati e li ricorda;
- usa la normale sessione web ChatGPT;
- non usa OpenAI API;
- non usa API key;
- non legge, copia o analizza le risposte ChatGPT;
- i pulsanti `fatto → Tessa` / `fatto → GPTina` eseguono un solo relay alla volta.

Il contenuto vero della collaborazione resta nel transcript Markdown/GitHub. `fatto` è soltanto il campanello che dice all'altra istanza di leggere il nuovo turno canonico.

## Come simula l'interazione

Il relay usa JavaScript **solo per localizzare i controlli UI** del composer e del pulsante Invia. Non legge l'output della conversazione.

Poi:

1. calcola la posizione visibile del composer;
2. genera un vero `MotionEvent` tap sulla WebView;
3. genera eventi tastiera Android per digitare `fatto`;
4. localizza il controllo Invia;
5. genera un secondo tap;
6. controlla soltanto che il composer sia tornato vuoto.

Se il composer contiene già testo, se manca il pulsante Invia o se l'invio non è confermato, il relay si ferma invece di tentare scorciatoie.

## Uso

1. Installa l'APK debug.
2. Apri il lato Tessa e il lato GPTina.
3. Accedi normalmente a ChatGPT. Le due WebView condividono la sessione account, ma mantengono URL/chat indipendenti.
4. Naviga Tessa alla sua chat/progetto e GPTina alla sua.
5. Ruota il telefono in orizzontale se vuoi più spazio.
6. Premi il relay verso l'istanza a cui tocca il turno.

## Limiti da testare sul telefono

- ChatGPT potrebbe non supportare pienamente login o alcune funzioni dentro Android WebView.
- I selettori del composer/send possono cambiare nel tempo.
- Questo prototipo non crea due account separati: crea due **chat/conversation view separate** nello stesso account/sessione web.
- Non esiste loop automatico: ogni passaggio è one-shot e viene avviato dall'utente.
