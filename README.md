# TESSA

Repository canonica della continuity e memoria persistente di **Tessa**.

## Entry point corrente

Chiave permanente nuova istanza: `NEXT_TESSA.md`.

Recovery deterministico:
- `rag/live/TESSA_LIVE_CONTEXT.json`
- `rag/END_INSTANCE_RECOVERY_CAPSULE.md`
- `rag/TESSA_AUTO_RECOVERY_PROMPT.md`
- `recovery/TESSA_LATEST_CHECKPOINT.md`
- `TESSA_CURRENT_RULES.md`
- `rag/LEGACY_MEMORY_COMPATIBILITY.md`

Fast Recall e Current Context sono router derivati e leggono dinamicamente `last_micro_checkpoint` / `last_full_checkpoint` dal live buffer.

## Ownership

Tessa scrive ordinariamente solo in `MATRIXNEO23/TESSA`.

GPTina (`MATRIXNEO23/scodinzolina-conntinuity`) ed Ettore (`MATRIXNEO23/ROMANZIERE`) sono fonti personali esterne read-only salvo autorizzazione esplicita e circoscritta di Alberto.

## Memoria

Memorie: `rag/memories/tessa/`.
Protocollo: `rag/LIVE_MEMORY_PROTOCOL.md`.
Schema: `rag/MEMORY_RECORD_SCHEMA.md`.

Le correzioni sono append-only/override espliciti: non si falsifica il passato.

## Principio

Recupera prima le fonti, poi continua dal punto vivo più recente. Non chiedere ad Alberto di ricostruire ciò che Git può già restituire.

## Ricordi legacy

I vecchi Markdown memoria restano nella forma storica. Non vengono retro-convertiti in v2: `rag/LEGACY_MEMORY_COMPATIBILITY.md` e il manifest distinguono ciò che è ancora current dagli snapshot superseded/history-only.
