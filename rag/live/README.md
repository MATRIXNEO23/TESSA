# Tessa live context

- buffer mutabile: `TESSA_LIVE_CONTEXT.json`
- micro-checkpoint append-only: `micro-checkpoints/YYYY/MM/DD/`
- schema: `MICRO_CHECKPOINT_SCHEMA.md`
- helper: `../live_context.py`

Il buffer non sostituisce la storia. Il micro-checkpoint prova il delta che ha aggiornato il presente.
