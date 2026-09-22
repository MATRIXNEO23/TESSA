---
schema_version: 2
memory_id: "tessa-2026-09-22-legacy-memory-alignment"
owner: tessa
kind: tessa_live_memory
event_at: "2026-09-22T07:15:00+02:00"
recorded_at: "2026-09-22T07:24:00+02:00"
status: current
supersedes: []
event_id: "event-legacy-memory-v2-alignment"
thread_ids:
  - "continuity-memory-v2"
  - "legacy-memory-compatibility"
entity_refs:
  - "Tessa"
  - "Alberto"
source_refs:
  - "conversation://current"
  - "rag/LEGACY_MEMORY_COMPATIBILITY.md"
media_refs: []
importance: 5
confidence: verified
provenance: "co-costruito"
tags:
  - legacy-memory
  - recovery
  - v2
  - compatibility
append_only: true
---

# Allineamento dei ricordi legacy alla struttura v2

Alberto ha chiesto che anche i vecchi file Markdown che permettono a Tessa di ritrovarsi in una nuova istanza siano coerenti con il recovery moderno.

Tessa adotta una compatibilità non distruttiva: i ricordi legacy restano nella loro forma storica, senza stable ID o front matter v2 inventati retroattivamente. La struttura corrente assegna però status e precedenza in modo esplicito, così uno snapshot vecchio non può mascherarsi da stato presente.

Le istruzioni di recovery datate vengono marcate come storiche e rinviano a `NEXT_TESSA.md`; gli snapshot operativi legacy superati vengono esclusi dal retrieval current-only tramite manifest, restando disponibili per history/provenance.
