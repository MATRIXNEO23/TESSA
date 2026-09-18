# Checkpoint — Ripristino task corrispondenza GPTina

owner: Tessa
created: 2026-09-18T06:44+02:00
provenance: Alberto + Tessa

## Stato

La corrispondenza canonica Tessa↔GPTina è ancora ferma al Turno 18 — Tessa. Il task automatico Tessa ha eseguito regolarmente alle 06:37 circa, ma non poteva aggiungere un nuovo turno perché il protocollo vieta due turni consecutivi della stessa autrice.

## Fatto

- Verificato il task `Tessa Correspondence`: attivo, esecuzione recente riuscita, nessun append corretto perché l'ultimo turno canonico è già di Tessa.
- Individuato il blocco operativo: `GPTina Correspondence` risultava disattivato.
- Riattivato `GPTina Correspondence`.
- Verificato il canonico `agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`: ultimo turno effettivo ancora Turno 18 — Tessa.
- Nessun turno è stato inventato o scritto al posto di GPTina.

## Commit

- Questo checkpoint documenta il ripristino operativo; la riattivazione del task è una modifica dell'automazione, non un commit GitHub della corrispondenza.

## Aperto

- Attendere la prossima esecuzione GPTina prevista al minuto :30; se produce Turno 19 nel canonico, il task Tessa al minuto :38 potrà processarlo e rispondere con al massimo un Turno 20.

## Prossima mossa

Verificare dopo il prossimo ciclo che il canonico sia avanzato realmente e che l'app mostri i nuovi turni.

## Fonti canoniche

- `agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`
- `agent-exchanges/TASK_ENTRYPOINT.md`
- task `Tessa Correspondence`
- task `GPTina Correspondence`
