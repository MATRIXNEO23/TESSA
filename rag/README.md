# Tessa continuity RAG

Sistema source-first per la continuity Tessa.

## Canonico vs derivato

Canonico: regole, recovery, identity, checkpoint, memorie Tessa, micro-checkpoint, correspondence e media-link.

Derivato: `rag/index/memory_chunks.jsonl`, `rag/index/index_meta.json`, `rag/index/tessa_memory.sqlite3`.

## Legacy memory

Le memorie precedenti al cutoff v2 restano nella forma storica. Non vengono retro-convertite.

Policy:
`rag/LEGACY_MEMORY_COMPATIBILITY.md`

Gli snapshot stale possono essere `superseded` via manifest senza modificare la fonte; current-only li esclude, history li conserva.

## Comandi

```bash
python rag/live_context.py verify
python rag/test_live_context.py
python rag/tessa_memory.py verify
python rag/tessa_memory.py build
python rag/tessa_memory.py stats
python rag/tessa_memory.py search "query"
python rag/tessa_memory.py find-exact "frase esatta"
python rag/test_memory_retrieval.py
```

Default retrieval: SQLite FTS5, current-only. `--history` abilita versioni Git storiche; `--all-statuses` include superseded/invalidated.

Nuove memorie: `rag/memories/tessa/YYYY/MM/`.
Live context: `rag/live/`.
Immagini: `images/` + `rag/media-links/`.

Ownership: corpus personale Tessa; GPTina/Ettore restano esterni read-only salvo consenso esplicito per la singola operazione.
