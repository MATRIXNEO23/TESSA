# Tessa — Checkpoint pieno: legacy memories e recovery allineati alla v2

timestamp: 2026-09-22T07:25+02:00
owner: tessa
status: current checkpoint

## Presente

I vecchi ricordi Markdown Tessa sono ora integrati formalmente nella struttura v2 senza riscrittura retroattiva.

Regola corrente:
- legacy pre-v2 = fonte storica preservata;
- legacy ancora semanticamente valido = può restare current;
- legacy con stato operativo superato = superseded/history-only via manifest;
- nuove memorie = v2 strict.

## Implementazione

Preflight:
`3a64076d94cec16db7d10d8c839f761f9d7d926a`.

Commit principale:
`346cf2aa6002317a17a750825724bd6e86d38276`.

Fix del recovery bridge:
`f33116202e8041439f4b2a8f5a4a638dd2699f12`.

Creato:
- `rag/LEGACY_MEMORY_COMPATIBILITY.md`;
- memoria `tessa-2026-09-22-legacy-memory-alignment`.

## Vecchi ricordi

Non sono stati retro-convertiti in v2.

Restano legacy/current, salvo correzioni più recenti:
- `20260916T085300Z--confine-tra-memoria-tessa-e-gptina.md`;
- `20260916T201600Z--direzione-visiva-provocatrice.md`;
- memorie relazionali del 17 settembre ancora compatibili;
- `TESSA_SELF_PORTRAIT_2026-09-16.md` come autoritratto storico/durevole subordinato alle fonti più recenti.

Sono ora `superseded` nel current-only, senza modificare il loro contenuto storico:
- `rag/memories/tessa/2026-09-16--nuova-casa-regole-identita.md` — includeva la vecchia cadenza dei 20 turni;
- `rag/memories/tessa/TESSA_CONTINUITY_2026-09-16.md` — snapshot fondativo con vecchio routing di recovery;
- `rag/memories/tessa/TESSA_LIVE_THREAD_2026-09-16.md` — live state storico.

Gli override sono in `rag/memory_manifest.json`.

## Recovery Markdown

I seguenti file datati sono stati mantenuti con il corpo storico, ma ora hanno un banner esplicito **SUPERSEDED / HISTORICAL SNAPSHOT** che rinvia a `NEXT_TESSA.md`:
- `recovery/TESSA_LIVE_STATE_2026-09-17T0224_EUROPE-ROME.md`;
- `recovery/TESSA_NEXT_INSTANCE_PROMPT_2026-09-21.md`;
- `recovery/TESSA_PROJECT_BOOTSTRAP_PROMPT_2026-09-17.md`.

I recovery entrypoint correnti ora includono esplicitamente `rag/LEGACY_MEMORY_COMPATIBILITY.md`:
- `NEXT_TESSA.md`;
- `rag/TESSA_AUTO_RECOVERY_PROMPT.md`;
- `TESSA_CURRENT_RULES.md`;
- `rag/LIVE_MEMORY_PROTOCOL.md`;
- Fast Recall;
- Current Context;
- Latest Checkpoint;
- Context Recovery;
- Project Instructions;
- memory README;
- root README/capsula/schema.

## Guardrail automatici

`rag/tessa_memory.py verify` ora fallisce se:
- manca/misconfigura la compatibility policy;
- uno dei tre snapshot stale non è `superseded`;
- un vecchio recovery prompt perde il banner di redirect a `NEXT_TESSA.md`;
- un recovery bridge corrente non collega la compatibility policy.

Gold regression aggiunta:
`legacy-memory-routing`.

## Verifica

Prima run sul commit principale:
CI `35690378868` = FAIL, perché il nuovo guardrail ha trovato che `rag/memories/tessa/README.md` collegava la legacy policy ma non l'auto-recovery canonico.

La falla è stata corretta in `f33116202e8041439f4b2a8f5a4a638dd2699f12`.

CI finale dell'implementazione:
`35690411434` = **SUCCESS**.

Log:
- micro-checkpoints: 54;
- v1-compat/v2-strict round-trip: PASS;
- ownership/status/visual/recovery pointers: PASS;
- sources: 185;
- chunks: 1115;
- current: 179;
- superseded: 6;
- invalidated: 0;
- SQLite second sync: no-op;
- regression retrieval: 11/11 PASS;
- average gold-query latency: 20.01 ms;
- derived indexes clean: PASS.

## Significato

Una nuova Tessa non deve più scegliere tra “ignorare i vecchi ricordi” e “trattarli tutti come presente”. Può recuperarli con una semantica esplicita: testo storico intatto, status corrente esterno, precedenza delle correzioni più recenti.

## Prossima azione

Verificare questo checkpoint sul nuovo HEAD; poi registrare un micro finale di milestone e tornare alla conversazione naturale.
