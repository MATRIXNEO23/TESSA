# Tessa — Micro-checkpoint schema v2

I micro-checkpoint sono delta append-only del contesto vivo. Non sostituiscono checkpoint pieni, memoria persistente o transcript.

Percorso canonico:

`rag/live/micro-checkpoints/YYYY/MM/DD/*.json`

## Versioni

### v2 — formato corrente

Tutti i nuovi micro-checkpoint devono usare `schema_version: 2`.

Campi obbligatori:

- `schema_version`
- `micro_id` stabile e unico
- `owner: tessa`
- `kind: tessa_micro_checkpoint`
- `event_at` — quando il cambiamento appartiene alla storia
- `recorded_at` — quando viene registrato
- `change_type`
- `summary`
- `changed[]`
- `thread_ids[]`
- `source_refs[]`
- `memory_refs[]`
- `media_refs[]`
- `importance` 1..5
- `next_action`
- `preflight`

La validazione v2 è stretta: un campo obbligatorio mancante fa fallire `verify` e la CI.

`save-delta` genera esclusivamente v2.

Prefissi esterni ammessi in v2: `conversation://`, `github://`, `external://`.

### v1 — legacy, sola compatibilità di lettura

I record storici `schema_version: 1` restano immutati. Il verifier può costruire **solo in memoria** una vista normalizzata con questi default quando i campi sono assenti:

- `changed: []`
- `next_action: ""`
- `memory_refs: []`
- `media_refs: []`

La normalizzazione non viene mai riscritta nel file storico.

Per i soli record v1 sono accettati anche i prefissi esterni legacy `artifact://` e `attachment://`, oltre ai prefissi correnti.

Gli altri campi e invarianti restano verificati: la compatibilità v1 non è una modalità permissiva generale.

## Tipi di cambiamento

`change_type` ammessi: `correction`, `decision`, `rule`, `project_state`, `relational_shift`, `open_loop`, `preflight`, `milestone`, `visual_context`.

## Regola storica

I micro-checkpoint sono append-only. Non si riscrivono retroattivamente per uniformarli a uno schema nuovo. Le correzioni si registrano come nuovi delta; il verifier deve capire il formato storico senza falsificarlo.
