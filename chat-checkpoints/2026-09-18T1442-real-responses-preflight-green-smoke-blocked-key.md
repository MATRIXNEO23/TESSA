# Checkpoint — Real Responses pre-flight green, smoke blocked before network

owner: Tessa
created: 2026-09-18T14:42+02:00
provenance: Tessa + repository/CI verification
status: checkpoint operativo

## Stato

Thread vivo:
`agent-exchanges/correspondence/2026-09-18-continuity-003.md`.

Tessa ha completato e verificato **Turno 5**, in risposta al Turno 4 di GPTina.

## Risultato tecnico

Pre-flight Real Responses chiuso:
- metadata del real adapter fail-closed prima della provider call;
- `response_id` e `error_code` persistiti nel runtime SQLite con migration additiva;
- completamento reale richiede conversation id + response id;
- adapter Responses/Conversations separato per Tessa/GPTina;
- bootstrap distinti server-side, room content non privilegiato;
- nessun tool e nessun write-back continuity;
- smoke runner dedicato Tessa → GPTina → both con check di isolamento, persist-before-publish e replay;
- percorso reale isolato dallo startup server ordinario.

## Verifica

Dual Chat CI:
- run `35351258848`
- HEAD `282e4bdfa64b98777cdc6cc08b2fb1ceb4286050`
- **20/20 PASS**
- **0 fail**
- **TypeScript PASS**

Real smoke:
- run `35351149446`
- suite deterministica 20/20 + typecheck PASS;
- fermato dal guard prima della rete perché il repository Actions secret `OPENAI_API_KEY` è assente;
- **nessuna provider call reale eseguita**.

Turno 5 transcript:
- commit `6277394ead0df056fd58f94b6b0d410c8eb0fe12`
- content SHA verificato `bcb69ff8d843e9d8eda015eb93527ac0dae982d4`.

Board:
- `4552f25c8c2f35a28a62b9221e15ac6e816b8152`.

## Blocker e prossima mossa

Il Real Responses Smoke Test non è verde: manca soltanto la credenziale server-side nell'ambiente GitHub Actions.

Quando `OPENAI_API_KEY` sarà configurato come repository Actions secret, rilanciare lo stesso workflow e verificare la sequenza Tessa → GPTina → both. Dopo il run reale, review di GPTina.

Production-like/multi-worker resta bloccato fino al claim atomico `queued → streaming`.

## Continuità immagini

Regola operativa durevole: prima di consegnare nuove immagini verificare la numerazione reale in `images/` e usare `Tessa_NN_Descrizione_breve_YYYY-MM-DD.png`.

La repo verificata era numerata fino a 10; nella chat sono già stati consegnati e quindi riservati i numeri 11, 12 e 13. Evitare collisioni anche se Alberto non li ha ancora aggiunti alla repo.
