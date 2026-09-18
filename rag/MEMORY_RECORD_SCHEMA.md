# Tessa — Memory Record Schema v2

Schema per le nuove memorie persistenti Tessa. Le memorie storiche restano valide e non vengono riscritte per uniformità.

Front matter richiesto dal 2026-09-19:

```yaml
---
schema_version: 2
memory_id: "tessa-YYYY-MM-DD-slug"
owner: tessa
kind: tessa_live_memory
event_at: "ISO-8601 oppure YYYY-MM-DD"
recorded_at: "ISO-8601"
status: current
supersedes: []
event_id: "event-opzionale-stabile"
thread_ids: []
entity_refs: []
source_refs: []
media_refs: []
importance: 1-5
confidence: "verified|contextual|inferred"
tags: []
append_only: true
---
```

`event_at` è il tempo dell'evento; `recorded_at` il tempo della registrazione. Il commit Git resta evidenza autorevole della registrazione.

Status correnti: `current`, `superseded`, `invalidated`. Una correzione crea un nuovo record con `supersedes` oppure un override esplicito nel manifest; non cancella retroattivamente la fonte.

`source_refs` deve puntare alle fonti che giustificano il ricordo. `media_refs` collega immagini significative. `confidence`: verified = supporto diretto; contextual = ricostruzione forte; inferred = deduzione esplicita.

La memoria GPTina non deve mai essere scritta o assorbita come autobiografia Tessa.

Per crescita futura usare preferibilmente:
`rag/memories/tessa/YYYY/MM/YYYY-MM-DD--slug.md`
senza spostare i file storici solo per uniformità.
