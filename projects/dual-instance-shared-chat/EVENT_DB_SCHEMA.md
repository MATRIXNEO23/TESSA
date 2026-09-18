# Event + DB Schema — candidate v0.2

status: review accepted — GPTina decisions integrated
scope: vertical slice 1

## Invarianti

- transcript append-oriented;
- `client_message_id` univoco per room;
- `event_id` globale monotono per replay/reconnect;
- un run per agente e messaggio sorgente;
- conversation OpenAI distinta per agente;
- nessuna tabella o endpoint di write-back continuity nel vertical slice 1.

## Schema SQLite

```sql
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE rooms (
  room_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE agents (
  room_id TEXT NOT NULL REFERENCES rooms(room_id),
  agent_id TEXT NOT NULL CHECK (agent_id IN ('tessa','gptina')),
  conversation_id TEXT,
  bootstrap_version TEXT NOT NULL,
  checkpoint_ref TEXT,
  context_cursor_event_id INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (room_id, agent_id)
);

CREATE TABLE messages (
  message_id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(room_id),
  client_message_id TEXT NOT NULL,
  author_id TEXT NOT NULL CHECK (author_id IN ('alberto','tessa','gptina')),
  target TEXT NOT NULL CHECK (target IN ('tessa','gptina','both')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (room_id, client_message_id)
);

CREATE TABLE runs (
  run_id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(room_id),
  source_message_id TEXT NOT NULL REFERENCES messages(message_id),
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','streaming','completed','failed','cancelled')),
  bootstrap_version TEXT NOT NULL,
  checkpoint_ref TEXT,
  api_mode TEXT NOT NULL DEFAULT 'standard_responses',
  model TEXT NOT NULL,
  context_builder_version TEXT NOT NULL,
  conversation_id_at_start TEXT,
  context_from_event_id INTEGER NOT NULL DEFAULT 0,
  context_through_event_id INTEGER NOT NULL,
  response_id TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  UNIQUE (source_message_id, agent_id),
  FOREIGN KEY (room_id, agent_id) REFERENCES agents(room_id, agent_id)
);

CREATE TABLE events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL REFERENCES rooms(room_id),
  message_id TEXT,
  run_id TEXT,
  agent_id TEXT,
  type TEXT NOT NULL,
  seq INTEGER,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (run_id, seq),
  CHECK (
    (run_id IS NULL AND seq IS NULL)
    OR
    (run_id IS NOT NULL AND seq IS NOT NULL AND seq >= 0 AND agent_id IS NOT NULL)
  ),
  FOREIGN KEY (message_id) REFERENCES messages(message_id),
  FOREIGN KEY (run_id) REFERENCES runs(run_id)
);
```

## Eventi iniziali

`message.created`, `run.queued`, `run.started`, `response.delta`, `response.completed`, `run.failed`, `run.cancelled`.

Gli eventi appartenenti a un run usano **sempre** `seq` crescente per quel run. `seq` è quindi obbligatorio quando `run_id` è presente; gli eventi di stanza non associati a un run, come `message.created`, lasciano `seq=NULL`. `event_id` definisce l'ordine globale osservato.

## POST messaggio

`POST /api/rooms/:room_id/messages`

Body:

```json
{"client_message_id":"uuid-client","target":"both","content":"..."}
```

Messaggio, run ed eventi iniziali vengono creati in una singola transazione. Un retry con lo stesso `client_message_id` restituisce gli stessi identificatori senza creare nuovi run.

## SSE

`GET /api/rooms/:room_id/events?after=<event_id>`

Envelope:

```text
id: 123
event: response.delta
data: {"event_id":123,"run_id":"...","agent_id":"tessa","seq":7,"payload":{}}
```

Alla riconnessione il server riproduce prima gli eventi persistiti con `event_id > after`, poi continua con i nuovi.

## Persistenza dei delta

Non persistiamo ogni micro-delta grezzo del provider.

L'adapter coalesca i delta provider in **chunk applicativi** (per soglia temporale e/o dimensione). Ogni `response.delta` che viene effettivamente emesso dal backend verso SSE viene prima persistito in `events` con il proprio `event_id` e `seq`; `response.completed` persiste poi il finale canonico.

In questo modo:
- il replay SSE è fedele agli eventi realmente osservabili dal client;
- evitiamo un record SQLite per ogni frammento minuscolo del provider;
- non esistono delta live "fantasma" privi di un identificatore durevole.

## Sidebar, testo condiviso e context cursor

Il requisito UI di Alberto non cambia l'isolamento degli agenti:

- la sidebar decide il **fan-out del nuovo messaggio** (`tessa`, `gptina`, `both`);
- cambiare selezione nella UI **non muta** da solo lo stato di alcun agente;
- la timeline applicativa resta condivisa;
- un agente non selezionato non riceve un run e la sua conversation non viene avanzata;
- quando quell'agente viene selezionato più tardi, il context builder recupera gli eventi di stanza non ancora incorporati a partire da `agents.context_cursor_event_id`;
- gli eventi recuperati sono serializzati come contenuto attribuito della stanza, mai come istruzioni privilegiate.

Ogni run registra `context_from_event_id` e `context_through_event_id`. Il cursor dell'agente avanza solo dopo completamento riuscito del run.

## Concorrenza e failure isolation

Con `target=both` i due run vengono creati atomicamente e avviati in parallelo dopo il commit. Ogni worker incrementa solo il proprio `seq`. Il fallimento di un worker genera `run.failed` senza interrompere l'altro.

## Contesto e ownership

L'output dell'altra istanza è contenuto della stanza, mai istruzione system/developer. Le istruzioni privilegiate arrivano solo dal bootstrap server-side dell'agente.

Il vertical slice 1 non espone endpoint continuity. Futuri adapter devono imporre server-side ownership personale e negare sempre cross-write.

## Test di gate

Prima del codice production-like devono risultare verdi:

1. isolamento Tessa/GPTina;
2. retry idempotente;
3. doppio stream distinguibile;
4. replay/reconnect senza duplicati;
5. failure isolation;
6. nessun loop automatico;
7. ownership server-side;
8. contaminazione dell'altra istanza trattata come contenuto non privilegiato.

## Decisioni GPTina — 2026-09-18

1. **`agents` scoped per room: confermato.** Nel vertical slice ogni room possiede il proprio stato Tessa/GPTina. Un eventuale profilo agente globale futuro va tenuto separato dallo stato conversazionale per-room.
2. **`seq` obbligatorio per ogni evento di run: sì.** Gli eventi non legati a un run possono usare `seq=NULL`.
3. **Delta: persistiamo ogni delta applicativo emesso, non ogni micro-delta provider.** L'adapter coalesca prima di persistere/streammare.
4. **Provenienza minima run:** oltre a `bootstrap_version` e `checkpoint_ref`, fissiamo `api_mode`, `model`, `context_builder_version`, `conversation_id_at_start`, `context_from_event_id` e `context_through_event_id`.

Questa provenienza è sufficiente per sapere con quale stato, modello e finestra di transcript condiviso è stato costruito un run senza trasformare il DB in una copia della continuity.


## Provider Adapter Readiness — decisioni implementate 2026-09-18

### Recovery dopo restart/crash

- un run persistente `queued` resta `queued` ed è enumerabile come recuperabile/rieseguibile;
- un run trovato `streaming` all'apertura del DB viene marcato `failed` con causa `interrupted_by_restart`;
- un run `streaming` interrotto **non viene rilanciato automaticamente**, evitando una possibile doppia chiamata provider;
- il cursor agente resta invariato sul run interrotto.

### Lifecycle conversation

Il `conversation_id` è stato separato per `(room_id, agent_id)`. Il provider riceve `conversation_id_at_start`; dopo un completamento riuscito può restituire il conversation id risultante, che viene persistito soltanto nello stato dell'agente proprietario. Failure e run dell'altro agente non lo modificano.

### Bootstrap e provenienza

L'adapter provider espone metadata server-side distinti per agente:

- `api_mode`;
- `model`;
- `bootstrap_version`;
- `checkpoint_ref`;
- `context_builder_version`;
- istruzioni privilegiate del bootstrap.

Al passaggio `queued → streaming` la provenienza del run viene materializzata dai metadata effettivi dell'adapter. Le istruzioni privilegiate vengono passate separatamente dal room context e non sono derivate dal transcript condiviso.

### Delta provider

I micro-delta del provider vengono accumulati in chunk applicativi per soglia di dimensione configurabile. Solo il chunk applicativo viene persistito come `response.delta`; la pubblicazione live avviene **dopo** la persistenza. Il testo finale canonico resta la concatenazione completa dei chunk applicativi.

Queste decisioni sono verificate dal gate `Provider Adapter Readiness` con provider fake stateful; non abilitano da sole le Responses reali, che restano dietro review/feature flag.


## Real Responses pre-flight — 2026-09-18

Prima di una chiamata provider reale:

- il real adapter dichiara `requiresCompleteMetadata=true`;
- metadata mancanti, vuoti o placeholder (`pending`/`unconfigured`) falliscono chiuso prima della provider call;
- il runtime SQLite migra in modo additivo le installazioni v0.2 aggiungendo `response_id` e `error_code` se mancanti;
- un completamento reale è accettato solo se l'adapter restituisce sia il `conversation_id` effettivo sia il provider `response_id`;
- `response_id` viene scritto nel run prima di emettere `response.completed`;
- i failure persistono `error_code` e `error_message`; il recovery da restart usa `error_code=interrupted_by_restart`;
- il flag `REAL_RESPONSES_ENABLED` è OFF per default; senza opt-in esplicito non viene costruito il percorso reale.
