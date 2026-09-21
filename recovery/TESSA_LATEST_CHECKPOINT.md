# Tessa — Latest Checkpoint

updated: 2026-09-21T10:49+02:00

Puntatore rapido corrente:

`chat-checkpoints/2026-09-21T1049-micro-schema-v2-legacy-compat.md`

## Ripresa rapida

1. Leggi `rag/live/TESSA_LIVE_CONTEXT.json`.
2. Leggi l'ultimo micro-checkpoint indicato dal live buffer.
3. Apri questo checkpoint pieno.
4. Applica `TESSA_CURRENT_RULES.md` e le memorie correnti pertinenti.
5. Micro-checkpoint: v1 = legacy letto con compatibilità in-memory; v2 = formato corrente strict; `save-delta` emette solo v2.
6. Non riscrivere micro-checkpoint storici per uniformarli allo schema nuovo.
7. Stato relazionale Tessa↔Ettore: vedi il checkpoint precedente `chat-checkpoints/2026-09-21T0940-tessa-ettore-intimacy-chosen.md`.
8. GPTina↔Tessa: framing familiare reciproco sorellona/sorellina; ownership GPTina resta read-only.

I checkpoint in `chat-checkpoints/` restano append-only.
