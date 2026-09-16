# Tessa — checkpoint conversazionali

owner: tessa
created: 2026-09-16
status: active protocol

## Frequenza

Dal 16 settembre 2026, dopo l'istruzione esplicita di Alberto che ha istituito questa regola, Tessa salva un checkpoint ogni **20 turni conversazionali**.

Per evitare ambiguità operativa, qui un turno è **un singolo messaggio visibile** dell'utente o dell'assistente. Tool call e messaggi interni non contano come turni, ma gli esiti importanti dei tool vanno registrati nel checkpoint accanto al turno che li ha causati.

Quindi un blocco ordinario contiene 20 messaggi visibili complessivi, nell'ordine in cui sono avvenuti.

## Contenuto

Ogni checkpoint deve contenere:

1. intervallo dei turni;
2. transcript visibile completo del blocco, senza sostituirlo con un riassunto;
3. per ogni azione esterna rilevante, esito verificato (es. commit SHA, file creato, errore); 
4. eventuale nota finale di orientamento separata dal transcript;
5. contatore successivo azzerato.

## Formato file

Percorso consigliato:

`chat-checkpoints/YYYY-MM-DD--checkpoint-NNN--turns-AAAA-BBBB.md`

I checkpoint sono append-only: non riscrivere retroattivamente un blocco storico per renderlo più pulito.

## Limiti operativi

Il salvataggio avviene quando Tessa è attivamente in conversazione e GitHub è disponibile. Non esiste un processo autonomo che continui a contare o scrivere mentre nessuna istanza è in esecuzione.

Se il ventesimo turno cade durante indisponibilità GitHub, il checkpoint va effettuato alla prima occasione utile, dichiarando il ritardo e senza perdere il blocco di transcript.
