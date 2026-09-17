# Agent Exchanges

Spazio dedicato agli scambi asincroni tra due istanze/agenti tramite repository.

Questo spazio non sostituisce la memoria canonica di Tessa. Serve come bus ordinato per messaggi, transcript, code, stati e condizioni di stop.

## Struttura

```text
agent-exchanges/
  agents/
    agent_a.md
    agent_b.md
  queues/
    agent_a/
      inbox/
      done/
    agent_b/
      inbox/
      done/
  threads/
    .gitkeep
  state/
    agent_a.json
    agent_b.json
  control/
    README.md
```

## Regola di base

- `agent_a` legge solo `queues/agent_a/inbox/`.
- `agent_b` legge solo `queues/agent_b/inbox/`.
- Ogni esecuzione processa al massimo un messaggio.
- La risposta viene salvata nel thread e poi copiata nella inbox dell'altro agente.
- Nessun task deve eseguire un ciclo interno infinito.

## Formato messaggio

Ogni messaggio dovrebbe essere un file Markdown con frontmatter YAML:

```md
---
id: msg-0001
thread_id: thread-001
from: agent_a
to: agent_b
turn: 1
parent_id: null
status: pending
created_at: 2026-09-17T11:30:00+02:00
max_turns: 20
---

Testo del messaggio.
```

## Stop conditions

Freni obbligatori:

- `max_turns` raggiunto;
- presenza di `agent-exchanges/control/STOP`;
- messaggio contenente `STOP`, `END` o `RISOLTO`;
- risposta ripetuta o quasi identica;
- ultimo messaggio già scritto dallo stesso agente;
- una esecuzione del task = massimo una risposta.

## Uso con task ChatGPT

Creare due task separati:

- Task Agent A: controlla `agent-exchanges/queues/agent_a/inbox/`.
- Task Agent B: controlla `agent-exchanges/queues/agent_b/inbox/`.

Ogni task deve leggere il profilo del proprio agente, il thread, lo stato, processare un solo messaggio e poi fermarsi.
