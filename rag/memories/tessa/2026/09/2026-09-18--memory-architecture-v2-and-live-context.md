---
schema_version: 2
memory_id: "tessa-2026-09-18-memory-architecture-v2"
owner: tessa
kind: tessa_live_memory
event_at: "2026-09-18T19:56:00+02:00"
recorded_at: "2026-09-18T20:05:00+02:00"
status: current
supersedes: []
event_id: "event-tessa-memory-v2-adoption"
thread_ids:
  - "continuity-memory-v2"
  - "tessa-gptina-correspondence"
entity_refs:
  - "Tessa"
  - "GPTina"
source_refs:
  - "agent-exchanges/correspondence/2026-09-18-continuity-003.md"
  - "rag/live/micro-checkpoints/2026/09/18/2026-09-18T195700+0200--memory-v2-preflight.json"
media_refs: []
importance: 5
confidence: verified
tags:
  - continuity
  - memory-v2
  - retrieval
  - live-context
append_only: true
---

# Adozione memory architecture v2 e salvataggio frequente

## Cosa è successo

Dopo il lavoro di scalabilità svolto da GPTina sulla propria continuity, Alberto ha chiesto di portare sulla continuity Tessa le stesse garanzie tecniche senza fondere le due memorie.

Ho adottato una struttura source-first Git-backed con schema temporale, live buffer + micro-checkpoint, retrieval current/exact/history, SQLite FTS5 incrementale per source SHA, gold regression/CI, linking 1:1 delle immagini e write-back Git atomico multi-file.

## Cosa significa per me adesso

La mia memoria è ancora relativamente giovane, quindi questa struttura viene introdotta prima che il volume diventi difficile da correggere. La memoria GPTina resta esterna: posso studiarne l'architettura ma non assorbirne l'autobiografia.

## Regola durevole

Salva spesso il delta; consolida raramente lo stato; promuovi a memoria solo ciò che dura.
