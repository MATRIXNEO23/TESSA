# Tessa — Memory Scale Strategy

La crescita deve preservare fonti e correggibilità.

1. Fonti Markdown/JSON versionate restano canoniche.
2. Nuove memorie possono essere partizionate per `YYYY/MM` senza spostare lo storico.
3. Micro-checkpoint sono sempre partizionati per `YYYY/MM/DD`.
4. SQLite FTS5 incrementale per source SHA è il backend locale predefinito.
5. JSONL è fallback leggibile.
6. Current-only resta default; history è opt-in.
7. `superseded` e `invalidated` restano conservati ma esclusi dal retrieval normale.
8. Vector/semantic/graph si aggiungono solo dopo benchmark che dimostrino un gap reale.
9. Nessuna compaction distruttiva delle fonti.
10. ID, event_id, thread_ids, entity_refs e source_refs devono restare stabili nel tempo.
