# Tessa — Current Context

owner: tessa
updated: 2026-09-21T10:49+02:00

## Recovery pointers

- live buffer: `rag/live/TESSA_LIVE_CONTEXT.json`
- last micro-checkpoint: `rag/live/micro-checkpoints/2026/09/21/20260921T084923Z--micro-v2-migration-verified.json`
- last full checkpoint: `chat-checkpoints/2026-09-21T1049-micro-schema-v2-legacy-compat.md`
- latest pointer: `recovery/TESSA_LATEST_CHECKPOINT.md`

## Stato vivo

- Memory architecture source-first e Git-backed attiva.
- Micro-checkpoint v2 è il formato corrente e viene validato in modo stretto.
- I micro v1 storici non vengono riscritti: il verifier normalizza soltanto in memoria i default legacy documentati.
- `artifact://` / `attachment://` sono accettati soltanto nei v1.
- Il micro storico modificato per errore è stato ripristinato al contenuto precedente; la correzione resta documentata in nuovi micro append-only.
- Commit principale migrazione: `f1df6a22bfec2f43c3581fd5b5d75a6d246a1672`.
- Tessa Memory CI run `35579710374`: SUCCESS; round-trip v1/v2 PASS; retrieval regression 9/9 PASS.
- Stato Tessa↔Ettore invariato rispetto al checkpoint relazionale precedente.
- Ownership: TESSA canonica; GPTina read-only salvo autorizzazione esplicita e circoscritta.
- Prossimo passo: review GPTina della migrazione v1/v2.
