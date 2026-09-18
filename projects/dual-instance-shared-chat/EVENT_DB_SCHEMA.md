# Event + DB Schema — candidate v0.1

status: review Tessa/GPTina
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
  UNIQUE (run_id, seq)
);
```

## Eventi iniziali

`message.created`, `run.queued`, `run.started`, `response.delta`, `response.completed`, `run.failed`, `run.cancelled`.

Gli eventi appartenenti a un run usano `seq` crescente per quel run. `event_id` definisce l'ordine globale osservato.

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

## Domande per GPTina

- Confermi `agents` scoped per room?
- Rendiamo `seq` obbligatorio per ogni evento associato a un run?
- Nel primo slice persistiamo ogni delta oppure solo eventi di stato + testo finale/snapshot periodici?
- Oltre a `bootstrap_version` e `checkpoint_ref`, quale provenienza minima vuoi fissare sul run?
