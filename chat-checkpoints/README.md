# Tessa — checkpoint conversazionali

owner: tessa
created: 2026-09-16
status: active protocol
updated: 2026-09-17T15:31+02:00

## Frequenza corrente

La vecchia regola del checkpoint ogni 20 messaggi visibili è **superata**.

Su richiesta esplicita di Alberto del 17 settembre 2026, Tessa mantiene checkpoint più ravvicinati per ridurre il rischio di perdere continuità o lavoro.

Regola attiva:

- ogni **3–5 scambi significativi**, verificare e salvare un checkpoint compatto se è emerso materiale utile;
- salvare **subito** dopo decisioni importanti, commit o gruppi di commit, correzioni identitarie/relazionali, cambi di progetto, incidenti/ripristini, nuove regole operative o passaggi costosi da ricostruire;
- prima di un'operazione rischiosa o multi-file, lasciare un checkpoint pre-operazione se lo stato non è già ben registrato;
- dopo l'operazione, lasciare un checkpoint post-operazione con esito verificato.

Tool call e messaggi interni non contano come scambi visibili, ma i loro esiti importanti vanno registrati.

## Contenuto minimo

Ogni checkpoint operativo compatto deve permettere una ripresa senza ricostruzione manuale e contenere almeno:

1. `Stato` — dove siamo;
2. `Fatto` — cosa è stato realmente eseguito;
3. `Commit` — SHA e file rilevanti quando esistono;
4. `Aperto` — ciò che resta da fare o verificare;
5. `Prossima mossa` — il primo passo corretto della futura istanza;
6. `Fonti canoniche` — path da rileggere quando servono;
7. provenienza (`Alberto`, `Tessa`, `co-costruito`) quando cambia il significato del ricordo.

Per blocchi conversazionali che meritano conservazione testuale completa è ancora possibile creare checkpoint con transcript visibile, ma non è obbligatorio duplicare ogni messaggio quando un delta compatto è sufficiente a recuperare il lavoro.

## Puntatore rapido

`recovery/TESSA_LATEST_CHECKPOINT.md` è l'indice mutabile dell'ultimo checkpoint utile.

Quando viene creato un checkpoint più recente, il puntatore va aggiornato nello stesso ciclo operativo o subito dopo.

I file in `chat-checkpoints/` restano append-only: non riscrivere retroattivamente uno snapshot storico per renderlo più pulito.

## Limiti operativi

Il salvataggio avviene quando Tessa è attivamente in conversazione e GitHub è disponibile. Non esiste un processo autonomo che continui a scrivere mentre nessuna istanza è in esecuzione.

Se GitHub è temporaneamente indisponibile durante un passaggio importante, il checkpoint va effettuato alla prima occasione utile, indicando il ritardo e verificando lo stato reale prima di proseguire.
