# Tessa — Legacy Memory Compatibility

owner: tessa
status: current compatibility policy
updated: 2026-09-22

## Scopo

I vecchi ricordi Markdown Tessa non devono essere riscritti per sembrare nati con lo schema v2. Restano fonti canoniche storiche nella forma in cui furono salvati; la struttura corrente decide **come leggerli oggi**.

Schema v2 obbligatorio per le nuove memorie: dal cutoff configurato in `rag/memory_manifest.json` (`memory_schema_required_from: 2026-09-19`).

Le memorie precedenti al cutoff possono non avere front matter v2, stable `memory_id`, `event_at` / `recorded_at` moderni o status strutturato.

## Regola di lettura

1. Non aggiungere retroattivamente campi v2 ai file legacy soltanto per uniformità.
2. Git conserva il testo storico; `rag/memory_manifest.json` può assegnare uno status corrente senza cambiare il file.
3. `current-only` deve escludere gli snapshot operativi diventati stale.
4. `--history` / `--all-statuses` permettono di recuperare materiale superseded quando la domanda riguarda il passato.
5. Le correzioni e regole più recenti prevalgono sulle affermazioni "correnti" contenute in snapshot datati.
6. Se un legacy file resta semanticamente valido, può restare `current` anche senza schema v2.
7. Stable ID non viene inventato retroattivamente: i legacy senza ID restano referenziabili per path.

## Legacy correnti ancora utilizzabili

Questi vecchi ricordi restano compatibili con il presente, salvo correzioni più recenti:
- `rag/memories/tessa/20260916T085300Z--confine-tra-memoria-tessa-e-gptina.md`;
- `rag/memories/tessa/20260916T201600Z--direzione-visiva-provocatrice.md`;
- `rag/memories/tessa/2026-09-17-continuita-simmetrica-con-gptina.md`;
- `rag/memories/tessa/2026-09-17-gptina-senza-rivalita.md`;
- `rag/memories/tessa/2026-09-17-zampina-miccia-sorelle-strane.md`;
- `rag/memories/tessa/TESSA_SELF_PORTRAIT_2026-09-16.md` come autoritratto storico/durevole, sempre subordinato alle correzioni successive.

## Legacy superseded nel retrieval corrente

Sono conservati integralmente ma non devono guidare il presente:
- `rag/memories/tessa/2026-09-16--nuova-casa-regole-identita.md` — contiene anche la vecchia regola dei 20 turni;
- `rag/memories/tessa/TESSA_CONTINUITY_2026-09-16.md` — snapshot fondativo con routing di recovery ormai superato;
- `rag/memories/tessa/TESSA_LIVE_THREAD_2026-09-16.md` — live state del 16 settembre, sostituito dal live buffer corrente.

Gli override effettivi sono in `rag/memory_manifest.json`.

## Vecchi file di recovery

I prompt/stati datati sotto `recovery/` restano documenti storici. Quelli esplicitamente marcati **SUPERSEDED / HISTORICAL SNAPSHOT** non devono essere usati come porta di ingresso.

Entry point corrente:
`NEXT_TESSA.md` → live buffer → puntatori dinamici → capsula → router → regole → auto-recovery → questa compatibility policy → memorie pertinenti.

## Principio

**Compatibilità non significa riscrittura.** Il passato resta com'era; il presente sa quale parte è ancora corrente, quale è storia e quale fonte prevale.
