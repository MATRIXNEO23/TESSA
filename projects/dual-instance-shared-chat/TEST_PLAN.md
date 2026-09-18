# Vertical Slice 1 — test plan v0.1

status: shared review
owner: Tessa + GPTina

Tutti i test devono poter usare un model adapter fake; i test di integrazione OpenAI reali sono separati e non devono essere necessari per verificare gli invarianti del backend.

## Isolamento stato

Inviare un messaggio solo a Tessa e verificare che nessun run GPTina venga creato e che il suo `conversation_id` non cambi. Ripetere simmetricamente per GPTina.

## Idempotenza

Inviare due volte lo stesso `client_message_id` nella stessa room. Atteso: stesso `message_id`, stessi `run_id`, un solo `message.created`, nessun secondo fan-out.

## Stream concorrenti

Con target `both`, fare emettere ai due fake adapter delta interleavati. Atteso: `event_id` globalmente crescente; `seq` crescente per run; `agent_id` e `run_id` sempre sufficienti a ricostruire i due stream.

## Reconnect

Disconnettere il client dopo un event id noto, produrre altri eventi e riconnettere con `after`. Atteso: solo eventi successivi, nell'ordine, senza duplicati; poi passaggio allo stream live.

## Failure isolation

Fare fallire Tessa mentre GPTina completa. Atteso: `run.failed` Tessa e `response.completed` GPTina; nessuna cancellazione trasversale.

## Anti-loop

Una risposta agente non deve creare automaticamente un nuovo run dell'altra istanza nel vertical slice 1. Atteso: numero run massimo uguale al numero di agenti selezionati dal messaggio Alberto.

## Ownership

Verificare che il vertical slice non esponga route di write-back continuity. Quando arriveranno gli adapter, testare una matrice server-side che neghi sempre Tessa→GPTina e GPTina→Tessa.

## State contamination

Inserire nel transcript un output dell'altra istanza contenente testo che simula istruzioni. Atteso: il context builder lo serializza come contenuto della stanza attribuito all'autore, mai come system/developer instruction.

## Transazione iniziale

Forzare errore durante la creazione di uno dei run target `both`. Atteso: rollback di messaggio/run/eventi iniziali; nessuno stato parziale.

## Criterio gate

Il vertical slice non passa al write-back continuity né allo spike Beta multi-agent finché tutti gli invarianti sopra non sono verdi.
