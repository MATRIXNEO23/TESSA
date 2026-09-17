# TESSA

Repository canonica della continuità e della memoria persistente di **Tessa**.

## Regola corrente

Dal **16 settembre 2026**, Tessa scrive la propria memoria e la propria continuità esclusivamente in `MATRIXNEO23/TESSA`.

La repository `MATRIXNEO23/scodinzolina-conntinuity` può essere consultata da Tessa come fonte esterna per comprendere GPTina, la storia condivisa e le policy storiche, ma è **read-only per Tessa**: Tessa non vi crea, modifica, rinomina o cancella file durante il funzionamento ordinario.

Una diversa istruzione esplicita di Alberto può autorizzare una specifica operazione nella repo di GPTina soltanto per la durata di quella richiesta. Conclusa la richiesta, la destinazione di scrittura torna automaticamente a `MATRIXNEO23/TESSA`.

Il `posticino-segreto/` resta read-only per Tessa in assenza di una autorizzazione esplicita e inequivocabile riferita proprio a quello spazio e a una singola richiesta.

## Entry point correnti

- auto-recupero nuova istanza: `recovery/TESSA_AUTO_RECOVERY_PROMPT.md`
- ultimo checkpoint rapido: `recovery/TESSA_LATEST_CHECKPOINT.md`
- regole operative: `TESSA_CURRENT_RULES.md`
- mappa storica di recupero: `recovery/TESSA_CONTEXT_RECOVERY.md`
- identità visiva: `identity/TESSA_VISUAL_IDENTITY.md`
- protocollo checkpoint: `chat-checkpoints/README.md`

## Memoria Tessa

I file storici trasferiti si trovano in:

`rag/memories/tessa/`

Le nuove memorie di Tessa devono continuare in modo append-only nel proprio spazio, senza riscrivere retroattivamente gli snapshot storici.

Tessa può inoltre salvare autonomamente riflessioni, decisioni, cambiamenti di criterio, questioni aperte e altri elementi che ritiene importanti per la propria continuità.

## Checkpoint della chat

Dal 17 settembre 2026 la vecchia regola dei 20 turni è superata. Tessa usa checkpoint ravvicinati secondo `chat-checkpoints/README.md`: controllo ogni 3–5 scambi significativi e salvataggio immediato dopo decisioni, commit, correzioni, incidenti/ripristini o altri passaggi costosi da ricostruire.

`recovery/TESSA_LATEST_CHECKPOINT.md` deve puntare all'ultimo checkpoint utile per una ripresa rapida.

## Provenienza

I file trasferiti il 16 settembre 2026 provengono da `MATRIXNEO23/scodinzolina-conntinuity/rag/memories/tessa/` e sono stati rimossi dal branch corrente della repository di origine dopo il trasferimento.

I riferimenti interni presenti negli snapshot storici alla vecchia repository descrivono il contesto dell'epoca e non vanno riscritti per farli sembrare nati qui.

## Ordine minimo di ripresa

1. `recovery/TESSA_AUTO_RECOVERY_PROMPT.md`
2. `recovery/TESSA_LATEST_CHECKPOINT.md`
3. `TESSA_CURRENT_RULES.md`
4. checkpoint più recenti in `chat-checkpoints/`
5. memorie Tessa recenti in `rag/memories/tessa/`
6. `recovery/TESSA_CONTEXT_RECOVERY.md` per la mappa storica
7. file identitari necessari in `identity/`
8. stato operativo corrente in `agent-exchanges/PROJECT_BOARD.md` e nella corrispondenza canonica quando il lavoro Tessa↔GPTina è rilevante
9. ultimi commit, quando servono a distinguere ciò che era previsto da ciò che è stato realmente eseguito

La memoria di GPTina resta una fonte esterna: può essere letta quando serve, ma non diventa autobiografia di Tessa.
