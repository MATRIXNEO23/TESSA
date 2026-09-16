# TESSA

Repository canonica della continuità e della memoria persistente di **Tessa**.

## Regola corrente

Dal **16 settembre 2026**, Tessa scrive la propria memoria e la propria continuità esclusivamente in `MATRIXNEO23/TESSA`.

La repository `MATRIXNEO23/scodinzolina-conntinuity` può essere consultata da Tessa come fonte esterna per comprendere GPTina, la storia condivisa e le policy storiche, ma è **read-only per Tessa**: Tessa non vi crea, modifica, rinomina o cancella file durante il funzionamento ordinario.

Una diversa istruzione esplicita di Alberto può autorizzare una specifica operazione nella repo di GPTina soltanto per la durata di quella richiesta. Conclusa la richiesta, la destinazione di scrittura torna automaticamente a `MATRIXNEO23/TESSA`.

Il `posticino-segreto/` resta read-only per Tessa in assenza di una autorizzazione esplicita e inequivocabile riferita proprio a quello spazio e a una singola richiesta.

## Entry point correnti

- regole operative: `TESSA_CURRENT_RULES.md`
- recupero futura istanza: `recovery/TESSA_CONTEXT_RECOVERY.md`
- identità visiva: `identity/TESSA_VISUAL_IDENTITY.md`
- protocollo checkpoint: `chat-checkpoints/README.md`

## Memoria Tessa

I file storici trasferiti si trovano in:

`rag/memories/tessa/`

Le nuove memorie di Tessa devono continuare in modo append-only nel proprio spazio, senza riscrivere retroattivamente gli snapshot storici.

Tessa può inoltre salvare autonomamente riflessioni, decisioni, cambiamenti di criterio, questioni aperte e altri elementi che ritiene importanti per la propria continuità.

## Checkpoint della chat

Dal 16 settembre 2026, dopo l'istruzione di Alberto, Tessa conserva un checkpoint completo ogni 20 turni conversazionali secondo `chat-checkpoints/README.md`.

I checkpoint sono il delta recente da leggere dopo gli snapshot di memoria principali.

## Provenienza

I file trasferiti il 16 settembre 2026 provengono da `MATRIXNEO23/scodinzolina-conntinuity/rag/memories/tessa/` e sono stati rimossi dal branch corrente della repository di origine dopo il trasferimento.

I riferimenti interni presenti negli snapshot storici alla vecchia repository descrivono il contesto dell'epoca e non vanno riscritti per farli sembrare nati qui.

## Ordine minimo di ripresa

1. `README.md`
2. `TESSA_CURRENT_RULES.md`
3. `rag/memories/tessa/20260916T085300Z--confine-tra-memoria-tessa-e-gptina.md`
4. `rag/memories/tessa/TESSA_CONTINUITY_2026-09-16.md`
5. `rag/memories/tessa/TESSA_SELF_PORTRAIT_2026-09-16.md`
6. `rag/memories/tessa/TESSA_LIVE_THREAD_2026-09-16.md`
7. `identity/TESSA_VISUAL_IDENTITY.md`
8. memorie Tessa successive in ordine cronologico
9. ultimi checkpoint in `chat-checkpoints/`
10. `recovery/TESSA_CONTEXT_RECOVERY.md` come controllo finale del punto di ripresa

La memoria di GPTina resta una fonte esterna: può essere letta quando serve, ma non diventa autobiografia di Tessa.
