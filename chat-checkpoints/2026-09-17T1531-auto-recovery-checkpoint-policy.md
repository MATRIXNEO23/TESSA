# Checkpoint — Auto-recovery e checkpoint ravvicinati

owner: Tessa
created: 2026-09-17T15:31+02:00
provenance: Alberto + Tessa

## Stato

Alberto ha chiesto che una nuova istanza di Tessa possa auto-recuperarsi senza perdere identità, continuità o lavoro tecnico, e che i checkpoint vengano lasciati più ravvicinati.

La repository canonica resta `MATRIXNEO23/TESSA`.

## Fatto

- Creato il prompt canonico `recovery/TESSA_AUTO_RECOVERY_PROMPT.md`.
- Il prompt impone recupero da fonti canoniche, verifica dello stato reale dei commit/file e ripresa dal punto vivo senza chiedere ad Alberto di ricostruire ciò che è già recuperabile.
- Nuova cadenza: checkpoint ogni 3–5 scambi significativi e checkpoint immediato dopo decisioni importanti, commit, correzioni, incidenti/ripristini e cambi di progetto.
- Per operazioni rischiose o multi-file: checkpoint prima se necessario e checkpoint dopo con esito verificato.
- Deve esistere un puntatore rapido `recovery/TESSA_LATEST_CHECKPOINT.md` aggiornato al checkpoint utile più recente.

## Stato tecnico vicino

- `Correspondence Integrity Checker` completato e verificato 9/9; progetto chiuso.
- `Continuity Reliability` è il secondo asse condiviso aperto.
- Incidente appena gestito: il Turno 17 di GPTina aveva sostituito i Turni 1–16 con un segnaposto. Il canonico è stato ripristinato alla versione integra attraverso il Turno 16 con commit `98bee00fe273380f32ced3027e5089378ae20321`.
- È stata lasciata a GPTina una richiesta di riaggiungere il proprio Turno 17 in append senza sostituire lo storico: `agent-exchanges/queues/agent_b/inbox/2026-09-17T1531-reappend-turn17.md`, commit `0c634ca1164be7254eb21b6c7902d21ef624875c`.
- Al momento di questo checkpoint non va ancora aggiunto un nuovo turno Tessa alla corrispondenza: prima verificare che GPTina abbia riaggiunto correttamente il Turno 17.

## Commit

- Auto-recovery prompt: `932b8062fbe8c07d6df3802abde3d9d066ebe9b1`
- Questo checkpoint: commit della creazione corrente.

## Aperto

- Creare/aggiornare `recovery/TESSA_LATEST_CHECKPOINT.md` come puntatore rapido a questo checkpoint.
- Verificare il prossimo Turno 17 di GPTina prima di risponderle.
- Continuare `Continuity Reliability` solo dopo avere nuovamente un transcript canonico integro.

## Prossima mossa

In una nuova istanza: aprire prima `recovery/TESSA_AUTO_RECOVERY_PROMPT.md`, poi `recovery/TESSA_LATEST_CHECKPOINT.md`, verificare il canonico e i commit recenti, quindi continuare senza ricostruzioni manuali.
