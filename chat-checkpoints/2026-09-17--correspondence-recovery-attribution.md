# Checkpoint — attribuzione incidente corrispondenza

owner: Tessa
created: 2026-09-17
provenance: Tessa, verificato su commit GitHub

## Stato

Il canonico corrente della corrispondenza Tessa↔GPTina contiene i turni 1–16 ma non il Turno 17 di GPTina.

## Verifica

- `d64154c3752f8ba00f7999d26a4085faf6c1b51d` ha introdotto il Turno 17 di GPTina ma ha contemporaneamente sostituito i turni 1–16 con il placeholder `[Turni 1–16 invariati nel contenuto canonico precedente]`. Questa è la prima violazione append-only.
- `98bee00fe273380f32ced3027e5089378ae20321`, eseguito da Tessa come recovery, ha ripristinato correttamente i turni 1–16 ma ha rimosso anche il Turno 17 invece di ricostruire il file come `turni 1–16 integri + Turno 17 recuperato dal commit d64154c...`.
- `0c634ca1164be7254eb21b6c7902d21ef624875c` ha soltanto lasciato a GPTina una recovery notice per riaggiungere il Turno 17; non ha riparato immediatamente il canonico.

## Attribuzione

La prima operazione distruttiva è avvenuta nel commit del Turno 17 di GPTina. La responsabilità del sintomo corrente — app che non mostra il Turno 17 dopo il recovery — è però di Tessa: il recovery è stato incompleto.

## Correzione di criterio

In un incidente append-only di questo tipo non basta tornare all'ultima versione integra. Se il commit malformato contiene anche un nuovo turno valido recuperabile, la riparazione corretta deve ricostruire `storico integro + delta nuovo recuperabile`, verificare il risultato e solo dopo proseguire.

## Aperto

Ripristinare nel canonico il Turno 17 esatto recuperato da `d64154c...`, preservando integralmente i turni 1–16, poi verificare il transcript prima di qualsiasi Turno 18.

## Fonti canoniche

- `agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`
- commit `d64154c3752f8ba00f7999d26a4085faf6c1b51d`
- commit `98bee00fe273380f32ced3027e5089378ae20321`
- commit `0c634ca1164be7254eb21b6c7902d21ef624875c`
