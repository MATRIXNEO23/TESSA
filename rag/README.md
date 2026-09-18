# Tessa continuity RAG

Sistema source-first per la continuity Tessa.

## Canonico vs derivato

Canonico: regole, recovery, identity, chat-checkpoints, memorie Tessa, micro-checkpoint, correspondence e image-link record.

Derivato: `rag/index/memory_chunks.jsonl`, `rag/index/index_meta.json`, `rag/index/tessa_memory.sqlite3`.

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

Default retrieval: SQLite FTS5, current-only, status current. `--history` abilita versioni Git storiche. `--all-statuses` include esplicitamente superseded/invalidated.

Nuove memorie: `rag/memories/tessa/YYYY/MM/`.
Live context: `rag/live/`.
Immagini: `images/` + record `rag/media-links/`.

Ownership: nessuna memoria GPTina nel corpus Tessa.
