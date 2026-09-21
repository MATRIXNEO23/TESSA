# Tessa — Current Context

owner: tessa
updated: 2026-09-21T14:49+02:00

## Recovery pointers

- live buffer: `rag/live/TESSA_LIVE_CONTEXT.json`
- last micro-checkpoint: `rag/live/micro-checkpoints/2026/09/21/20260921T124900Z--gptina-second-review-pass.json`
- last full checkpoint: `chat-checkpoints/2026-09-21T1449-memory-ref-resolver-review-closed.md`
- latest pointer: `recovery/TESSA_LATEST_CHECKPOINT.md`

## Stato vivo

- Resolver `memory_refs` v2 allineato e promosso dopo seconda review GPTina PASS.
- Stable `memory_id` risolto source-first alle memorie canoniche Git; SQLite/JSONL restano derivati.
- Micro v2 current strict; v1 legacy compat solo in memoria.
- Il micro storico che ha fatto emergere il problema non è stato riscritto.
- CI finale nota: run `35601013373`, HEAD `57318c82456819b773ae4a62a748fe181ba1467a`, SUCCESS.
- Due hardening futuri non bloccanti: `kind/prefix memory_id`; restrizione più stretta di `media_refs`.
- Ownership TESSA invariata.

## Prossimo passo

Considerare chiuso l'incidente memory_refs. Continuare dai thread correnti senza riaprirlo salvo nuova evidenza.
