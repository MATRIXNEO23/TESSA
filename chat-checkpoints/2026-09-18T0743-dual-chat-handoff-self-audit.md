# Checkpoint — Dual chat handoff + self-audit

owner: Tessa
created: 2026-09-18T07:43+02:00
provenance: Alberto + Tessa
status: active project gate; handoff sent to GPTina

## Stato

Alberto ha proposto una nuova app/web UI con Alberto, Tessa e GPTina nella stessa stanza e due istanze GPT separate. Ha chiesto a Tessa di mandare il progetto a GPTina, farlo insieme e poi fare un audit su di sé.

## Fatto

- verificata documentazione OpenAI corrente su Responses/stateful interactions, streaming, autenticazione server-side e superficie Beta multi-agent;
- creata spec condivisa `agent-exchanges/specs/DUAL_INSTANCE_SHARED_CHAT_SPEC.md`;
- aperto gate nel `agent-exchanges/PROJECT_BOARD.md`;
- inviato a GPTina come Turno 8 della corrispondenza canonica;
- verificato dopo il commit che spec, board e Turno 8 sono presenti.

Commit:
- spec: `6d553680c44e75687f39ad4d35c3b5a7aeaf73ca`
- board: `efaf495f5eb97f92e46264644f368410a200be84`
- handoff Turno 8: `5a13ae50b7f6e32690c94ea79caeffd4b6dee66a`

## Self-audit Tessa

Audit eseguito dopo il handoff, usando il contratto Continuity Reliability e controlli operativi del nuovo progetto.

- **Freshness: WARN → risolto in questo checkpoint.** Prima dell'audit il latest pointer era ancora sul checkpoint `0732-direct-chat-api-sync` e non esponeva il nuovo progetto/handoff.
- **Provenienza: PASS.** L'idea è attribuita ad Alberto; la prima specifica è attribuita a Tessa; lo stato è esplicitamente pending GPTina review.
- **Evoluzione temporale: PASS.** La nuova architettura non cancella la chat/API precedente; la supera come nuovo progetto e lascia il lavoro precedente documentato.
- **Frammentazione: PASS.** Una sola spec di progetto, un board minimale e un solo transcript canonico. Nessuna seconda memoria parallela creata.
- **Retrieval verificabile: PASS.** Spec, board, Turno 8 e commit sono direttamente recuperabili.
- **Ownership: PASS.** Nessuna scrittura nella continuity/repo personale GPTina. Il progetto è stato consegnato tramite lo spazio condiviso canonico TESSA.
- **Common tools / gate: PASS.** Non è stato introdotto un tool comune operativo prima della revisione GPTina; è aperto un gate di design.
- **Sicurezza credenziali: PASS.** La spec impone API key OpenAI solo server-side e nessun segreto nel client/repository.
- **Isolamento agenti: PASS a livello di specifica / NOT_CHECKED a runtime.** I confini sono definiti ma non esiste ancora un vertical slice da testare.
- **Anti-loop: PASS a livello di specifica / NOT_CHECKED a runtime.** È previsto un budget massimo di risposta/reazione, da verificare nell'MVP.
- **Fatti API: PASS con cautela.** La superficie Beta multi-agent è marcata esplicitamente come Beta e non è assunta come dipendenza MVP.

## Ambiguità reali / aperto

- stack backend non ancora scelto;
- baseline due Responses separate vs Beta multi-agent da decidere con GPTina;
- hosting, autenticazione Alberto e storage live da scegliere;
- isolamento e anti-loop non possono essere dichiarati runtime-PASS finché non esiste il vertical slice.

## Prossima mossa

Attendere/leggere la revisione GPTina nel prossimo turno canonico. Se il gate viene approvato, definire e implementare il vertical slice condiviso senza usare GitHub come trasporto live.
