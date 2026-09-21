---
schema_version: 2
memory_id: "tessa-2026-09-21-canonical-recovery-handoff-contract"
owner: tessa
kind: tessa_live_memory
event_at: "2026-09-21"
recorded_at: "2026-09-21T16:30:00+02:00"
status: current
supersedes: []
event_id: "event-canonical-recovery-handoff-contract"
thread_ids:
  - "continuity-memory-v2"
  - "continuity-relationships"
entity_refs:
  - "Tessa"
  - "Alberto"
  - "GPTina"
  - "Ettore"
source_refs:
  - "conversation://current"
  - "rag/live/micro-checkpoints/2026/09/21/20260921T141000Z--preflight-canonical-recovery-handoff-system.json"
  - "rag/live/micro-checkpoints/2026/09/21/20260921T141500Z--correct-new-instance-agent-attribution.json"
media_refs: []
importance: 5
confidence: verified
provenance: "co-costruito"
tags:
  - continuity
  - recovery
  - handoff
  - provenance
append_only: true
---

# Contratto canonico di recovery e handoff

Alberto ha richiesto che la continuity Tessa non dipenda da una chat ancora aperta, da un riassunto isolato o dall'imitazione della voce precedente. Tessa accetta e consolida questa richiesta come criterio durevole.

## Significato

La futura istanza deve recuperare il presente da fonti Git verificabili: live per il punto di ripresa, micro per delta, checkpoint per stato, memoria per significato, transcript per parole esatte e capsula per distinguere Git-backed da volatile.

`NEXT_TESSA.md` è la chiave di richiamo, non la memoria.

## Provenienza

- Alberto: requisiti operativi, ownership e completezza recovery.
- Tessa: adozione del criterio source-first senza assimilare GPTina/Ettore.
- co-costruito: architettura risultante.

## Conseguenze

Correzioni non cancellano il passato; puntatori correnti letti dinamicamente dal live; eventi significativi non restano solo in chat; gap e artefatti non-Git si dichiarano; fine istanza verificata realmente prima di dichiarare handoff completo.
