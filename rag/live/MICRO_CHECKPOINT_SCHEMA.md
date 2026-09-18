# Tessa — Micro-checkpoint schema v1

I micro-checkpoint sono delta append-only del contesto vivo. Non sostituiscono checkpoint pieni, memoria persistente o transcript.

Percorso canonico:

`rag/live/micro-checkpoints/YYYY/MM/DD/*.json`

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

`change_type` ammessi: `correction`, `decision`, `rule`, `project_state`, `relational_shift`, `open_loop`, `preflight`, `milestone`, `visual_context`.

I riferimenti possono essere path reali della repo oppure URI espliciti `conversation://`, `github://`, `external://`.

Il live buffer è mutabile; i micro-checkpoint no. Le correzioni si aggiungono come nuovi delta.
