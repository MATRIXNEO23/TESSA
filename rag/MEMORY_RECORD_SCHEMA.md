# Tessa — Memory Record Schema v2

Le nuove memorie persistenti Tessa usano front matter:

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
event_id: "event-opzionale"
thread_ids: []
entity_refs: []
source_refs: []
media_refs: []
importance: 1-5
confidence: "verified|contextual|inferred"
provenance: "Alberto|Tessa|co-costruito|mixed"
tags: []
append_only: true
---
```

Le memorie storiche non si riscrivono solo per uniformità.

`event_at` = tempo dell'evento. `recorded_at` = tempo della registrazione.

`memory_id` è stabile/unico e può essere usato nei `memory_refs`; il resolver source-first lo ricondurrà al file Tessa canonico. Le memorie storiche prive di ID restano referenziabili per path.

Status: `current`, `superseded`, `invalidated`. Una correzione crea un nuovo record con `supersedes` o override esplicito, senza cancellare il passato.

`provenance` è raccomandato quando identità, emozioni o relazioni richiedono di distinguere Alberto / Tessa / co-costruito. Non sostituisce `source_refs`.

Una memoria importante conserva fatto, provenienza, significato per Tessa, confini/conseguenze e cue di retrieval.

La memoria GPTina/Ettore non viene assorbita come autobiografia Tessa.

Nuove memorie: `rag/memories/tessa/YYYY/MM/YYYY-MM-DD--slug.md`.
