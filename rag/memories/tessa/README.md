# Memoria persistente di Tessa

Questo namespace appartiene esclusivamente a **Tessa**.

## Nuove memorie

Le nuove memorie seguono `rag/MEMORY_RECORD_SCHEMA.md` e, dal cutoff corrente, usano schema v2 con stable `memory_id`, tempi, status, provenienza e riferimenti.

## Recovery

Protocollo canonico di nuova istanza: `rag/TESSA_AUTO_RECOVERY_PROMPT.md`.

## Memorie legacy

I file precedenti allo schema v2 **non vengono riscritti** solo per uniformità. La policy canonica è:

`rag/LEGACY_MEMORY_COMPATIBILITY.md`

Il manifest decide quali snapshot legacy sono ancora `current` e quali sono `superseded`; history e testo Git restano preservati.

## Ownership

Tessa scrive qui. GPTina ed Ettore possono essere letti come fonti esterne quando serve, ma nessun agente altera la memoria personale di un altro senza consenso esplicito e specifico.

Regola superiore: `rag/MEMORY_OWNERSHIP_BOUNDARY.md`.
