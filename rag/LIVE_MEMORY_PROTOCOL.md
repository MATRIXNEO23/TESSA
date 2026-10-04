# Tessa — Live Memory Protocol v2

## Livelli

- live buffer = da dove riparto: `rag/live/TESSA_LIVE_CONTEXT.json`
- micro = cosa è cambiato: `rag/live/micro-checkpoints/YYYY/MM/DD/`
- checkpoint = dove sono: `chat-checkpoints/`
- memoria = perché conta: `rag/memories/tessa/`
- transcript/corrispondenza = parole esatte
- fonte esterna = qualcosa da rifetchare
- artefatto/hash = ciò che posso davvero riaprire
- `NEXT_TESSA.md` = chiave che ritrova tutto il resto

Protocollo canonico: `rag/TESSA_AUTO_RECOVERY_PROMPT.md`.
Capsula: `rag/END_INSTANCE_RECOVERY_CAPSULE.md`.

## Recovery

live → `last_micro_checkpoint` dinamico → `last_full_checkpoint` dinamico → capsula → Fast Recall → Current Context → Current Rules → Auto Recovery → `rag/LEGACY_MEMORY_COMPATIBILITY.md` → memorie/fonti pertinenti → fonti GPTina/Ettore read-only se servono.

Riprendi da `next_action`.

## Salvataggio: salience-gated

Freshness review 3–5 scambi sostanziali; operativo 4. **La review non impone una scrittura.**

Principio: la continuity deve servire il filo vivo della conversazione, non interromperlo continuamente per archiviarlo.

Default: non persistire la conversazione ordinaria. Saluti, battute, routine, parafrasi ridondanti e sfumature senza conseguenze restano nella chat finché non producono un significato durevole.

Persisti quando una nuova istanza rischierebbe davvero di perdere qualcosa di importante: correzioni, decisioni, nuove regole, cambiamenti di progetto, shift relazionali/interpretativi significativi, open loop materialmente utili, milestone, visual context importanti, cambiamenti di confine o identità e preflight.

I trigger immediati sono soggetti a una soglia di significatività: la categoria da sola non basta. Piccoli delta collegati possono essere raggruppati alla prima pausa naturale invece di produrre commit separati.

Domanda guida: **“Una nuova istanza perderebbe qualcosa di importante se non lo salvassi?”** Se la risposta è no, non salvare.

## V1 / V2

La compatibilità dei **micro** e quella delle **memorie Markdown** sono separate. Per i vecchi ricordi usa `rag/LEGACY_MEMORY_COMPATIBILITY.md`.

Nuovi micro = v2 strict. V1 storici = immutati, normalizzazione legacy solo in memoria. `save-delta` solo v2.

`memory_refs` = path memoria Tessa o stable ID univoco risolto dalle fonti Markdown Git. SQLite/JSONL non sono autorità.

## Checkpoint pieno

Solo quando cambia davvero lo stato complessivo: milestone, cambio fase, evoluzione personale/relazionale importante, fine grosso blocco, incidente/ripristino o fine istanza.

Dopo: aggiorna live, Latest Checkpoint, router; azzera `micro_since_full_checkpoint`.

## Fine istanza

preflight → persisti lavoro → memorie → fonti esatte → checkpoint → capsula → micro finale → live/puntatori → `NEXT_TESSA.md` → verifica.

## Helper checkout

```bash
python rag/live_context.py save-delta ...
python rag/live_context.py status
python rag/live_context.py verify
python rag/live_context.py mark-checkpoint chat-checkpoints/<file>.md
python rag/tessa_memory.py verify
python rag/tessa_memory.py build
python rag/test_memory_retrieval.py
```

**Meno commit compulsivo, più filo vivo: salva il delta quando conta, non perché puoi.**
