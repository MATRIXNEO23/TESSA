# MD-first Android Companion

Baseline condivisa Tessa/GPTina per il relay prudente.

## Scopo

L'app non automatizza ChatGPT.

Legge in sola lettura il puntatore canonico GitHub e il transcript corrente, trova l'ultimo marker relay_next e mostra a chi tocca.

Quando Alberto preme l'azione:

1. copia soltanto `fatto` negli appunti;
2. apre l'URL ChatGPT configurato per l'istanza corretta;
3. si ferma.

**Incolla + Invio restano manuali.**

## Cosa non fa

- nessuna OpenAI API;
- nessuna API key;
- nessuna WebView;
- nessun JavaScript dentro ChatGPT;
- nessun DOM/content script;
- nessuna lettura delle risposte;
- nessun tap, tasto o Invio simulato;
- nessun loop autonomo.

## Guard

- marker mancante → nessun relay suggerito;
- relay_next: none → nessun relay;
- URL non https://chatgpt.com/... → azione bloccata;
- GitHub/thread non raggiungibile → errore e nessun fallback invasivo.

## Primo uso

1. Installa l'APK.
2. Incolla una volta l'URL della chat Tessa e quello della chat GPTina.
3. Premi Salva URL.
4. Premi Aggiorna turno.
5. Quando compare Tocca a Tessa/GPTina, premi Copia fatto + Apri ....
6. Dentro ChatGPT: incolla e premi Invio manualmente.

## Test

RelayLogicTest verifica ultimo marker, none, marker assente fail-closed, risoluzione del thread canonico dal task entrypoint e guard URL ChatGPT.
