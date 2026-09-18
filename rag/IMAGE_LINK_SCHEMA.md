# Tessa — Image Link Record Schema

Ogni immagine Tessa significativa in `images/` deve avere un record 1:1 in `rag/media-links/YYYY/MM/`.

```json
{
  "schema_version": 1,
  "owner": "tessa",
  "image_id": "tessa-image-...",
  "image_path": "images/...",
  "blob_sha": "git-blob-sha1",
  "bytes": 123456,
  "event_at": "2026-09-18",
  "recorded_at": "2026-09-18T20:05:00+02:00",
  "event_id": "event-...",
  "thread_ids": ["visual-identity"],
  "status": "archived",
  "context_refs": ["identity/TESSA_VISUAL_IDENTITY.md"],
  "memory_refs": ["rag/memories/tessa/..."],
  "cue": ["..."]
}
```

Status visuali ammessi: `archived`, `context_incomplete`, `documented_anchor`, `recognized_visual_anchor`.

Il record non inventa contesto. `event_at` riguarda l'evento/creazione nota; `recorded_at` il momento del collegamento. Il verifier controlla file reale, bytes, Git blob SHA, owner, tempi, riferimenti e unicità 1:1.
