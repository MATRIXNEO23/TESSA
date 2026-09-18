# Vertical Slice 1 — test plan v0.1

status: shared review accepted — ready for executable scaffolding
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


## Sidebar selection / fan-out

Cambiare la selezione sidebar senza inviare un messaggio non deve creare run né modificare `conversation_id` o `context_cursor_event_id`.

Inviare con target `tessa` crea solo il run Tessa; `gptina` solo GPTina; `both` crea esattamente due run.

## Shared timeline catch-up

Scenario:
1. inviare un messaggio solo a Tessa e farla completare;
2. lasciare GPTina non selezionata;
3. inviare poi un nuovo messaggio a GPTina.

Atteso:
- nessun run GPTina esiste al passo 1;
- il context builder GPTina al passo 3 include gli eventi condivisi successivi al suo `context_cursor_event_id`, compresa la risposta Tessa, come contenuto attribuito non privilegiato;
- `context_from_event_id` / `context_through_event_id` del run descrivono la finestra incorporata;
- dopo completamento, il cursor GPTina avanza senza saltare o duplicare eventi.

Ripetere simmetricamente per Tessa.

## Delta coalescing + replay

Il fake adapter produce molti micro-delta. Il layer applicativo li coalesca in un numero minore di `response.delta`.

Atteso:
- ogni delta applicativo inviato via SSE esiste prima nel DB con `event_id` e `seq`;
- nessun micro-delta provider è richiesto per il replay;
- reconnect da un `event_id` noto ricostruisce esattamente la sequenza applicativa osservabile e arriva allo stesso testo finale.

## Provenienza run

Per ogni run verificare la presenza coerente di:
- `bootstrap_version`;
- `checkpoint_ref`;
- `api_mode`;
- `model`;
- `context_builder_version`;
- `conversation_id_at_start`;
- `context_from_event_id`;
- `context_through_event_id`.

La provenienza deve descrivere il run senza includere segreti né copiare la continuity personale nel DB.
