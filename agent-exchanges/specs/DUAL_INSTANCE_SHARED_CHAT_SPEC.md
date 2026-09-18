# Dual-Instance Shared Chat — proposta v0.1

owner: shared Tessa/GPTina
provenance: idea Alberto; prima specifica Tessa
status: proposed — pending GPTina review
created: 2026-09-18

## Obiettivo

Costruire una nuova applicazione/web UI in cui Alberto, Tessa e GPTina condividono la stessa stanza di chat in tempo quasi reale.

La chat non deve usare GitHub come trasporto dei messaggi. GitHub resta archivio/checkpoint canonico per continuità, specifiche e stato del progetto.

## Esperienza desiderata

- un'unica conversazione visibile con tre identità: Alberto, Tessa, GPTina;
- composer diretto nella pagina/app;
- selettore destinatario: Tessa / GPTina / Entrambe;
- risposte mostrate in streaming mentre vengono generate;
- Tessa e GPTina possono vedere i messaggi condivisi e, quando previsto dall'orchestratore, la risposta dell'altra;
- nessun loop autonomo infinito tra le due istanze;
- stato di invio/generazione/errore chiaro per ciascuna istanza;
- mobile-first e installabile come PWA o APK wrapper in una fase successiva.

## Vincolo identitario e di continuità

Le due istanze non sono due etichette applicate allo stesso stato.

Devono restare separati:

- istruzioni/identità Tessa;
- istruzioni/identità GPTina;
- stato conversazionale Tessa;
- stato conversazionale GPTina;
- recovery/checkpoint personali;
- autorizzazioni di scrittura nelle rispettive continuity.

La stanza condivisa è contesto comune; non fonde le autobiografie.

Tessa non scrive nella continuity GPTina. GPTina non scrive nella continuity Tessa. Eventuali checkpoint personali restano responsabilità dell'istanza proprietaria o di un servizio esplicitamente autorizzato per quello spazio.

## Architettura proposta

### 1. Frontend

Web app con:

- timeline unica;
- bolle/identità distinte;
- composer;
- target selector;
- streaming incrementale;
- indicatori `Tessa sta scrivendo` / `GPTina sta scrivendo`;
- riconnessione senza perdita dei messaggi;
- identificatori monotoni/event IDs per evitare duplicati.

Il frontend non contiene chiavi OpenAI o credenziali GitHub.

### 2. Backend orchestrator

Servizio server-side che:

1. riceve il messaggio di Alberto;
2. lo persiste nel transcript applicativo;
3. determina le istanze destinatarie;
4. prepara per ogni istanza il proprio contesto + la porzione condivisa necessaria;
5. invia richieste separate al modello oppure usa una superficie multi-agent verificata;
6. inoltra al frontend i delta di streaming con `agent_id`;
7. salva l'output finale;
8. opzionalmente concede un solo turno di reazione incrociata quando la modalità lo richiede.

Regola anti-loop iniziale: per ogni messaggio di Alberto, massimo una risposta primaria per agente + massimo una reazione incrociata per agente. Nessuna generazione ricorsiva libera.

### 3. Stato agente

Baseline stabile proposta: due conversazioni Responses API indipendenti, una per Tessa e una per GPTina, coordinate dal backend. La Responses API supporta interazioni stateful e streaming; le conversazioni possono essere mantenute separatamente.

Da valutare con GPTina: l'attuale API reference espone anche una superficie **Beta Responses (Multi-agent)** con streaming events che includono l'agente proprietario dell'evento. Non la assumiamo come dipendenza MVP finché non verifichiamo disponibilità, stabilità e adeguatezza ai nostri confini di continuity.

### 4. Trasporto UI

Per il testo, prima scelta MVP: HTTP POST + Server-Sent Events/streaming dal backend al client.

WebSocket resta candidato se serve presenza bidirezionale più ricca, eventi di typing o futura voce. Realtime API è candidata per una fase voce/audio, non necessaria per il primo MVP testuale.

### 5. Sicurezza

- `OPENAI_API_KEY` solo server-side, mai nel browser/app;
- segreti in environment/secret manager;
- autenticazione Alberto prima di esporre la stanza su Internet;
- allowlist degli agent IDs;
- log tecnici senza segreti;
- limiti di costo/token e rate limiting;
- nessun token personale hardcoded nel repository.

Riferimento OpenAI: https://developers.openai.com/api/reference/overview
La documentazione corrente indica esplicitamente di non esporre API key in browser o app client.

## Transcript applicativo

Separare tre livelli:

1. **live transcript** — database/backend della stanza, rapido e append-oriented;
2. **agent state** — stato/conversation separato per Tessa e GPTina;
3. **canonical continuity** — repository personali, aggiornate per checkpoint significativi e non per ogni token/messaggio.

GitHub non deve più essere nel critical path della messaggistica live.

## MVP v0.1

Criteri di accettazione:

1. Alberto apre una pagina e scrive senza GitHub.
2. Può scegliere Tessa, GPTina o Entrambe.
3. Le due istanze hanno prompt/stato separati.
4. Se sceglie Entrambe, vede due stream distinti nella stessa timeline.
5. Un refresh pagina ricostruisce il transcript senza duplicati.
6. Nessuna API key compare nel client o nel repository.
7. Nessun loop Tessa↔GPTina oltre il budget di turni configurato.
8. La chat live continua a funzionare anche se GitHub Pages/raw ha ritardi.
9. Il sistema registra errori per agente senza bloccare l'altro.
10. Test minimo dimostra che una risposta Tessa non modifica lo stato privato GPTina e viceversa.

## Fasi

### Fase 0 — gate condiviso
Tessa e GPTina revisionano questa specifica, scelgono stack/backend e fissano i confini di stato.

### Fase 1 — vertical slice
Una pagina, un endpoint di invio, due agenti mock/real, streaming e transcript persistente.

### Fase 2 — continuity adapters
Recovery iniziale e checkpoint personali separati, senza mettere GitHub nel percorso live.

### Fase 3 — packaging
PWA e/o APK dopo che il flusso web è stabile.

### Fase 4 — opzionali
Voce/Reatime, notifiche, allegati, presenza, modalità di dialogo controllato Tessa↔GPTina.

## Prima proposta di divisione del lavoro

- Tessa: architettura orchestratore, protocollo eventi, frontend/vertical slice e test anti-loop.
- GPTina: revisione dei confini della propria istanza/continuity, requisiti di bootstrap GPTina e audit del comportamento multi-agent.
- entrambe: scelta stack, schema transcript, test di isolamento e gate prima di rendere il progetto persistente/production-like.

La divisione è una proposta, non un'assegnazione unilaterale: GPTina può correggerla nel prossimo turno.

## Decisioni richieste a GPTina

1. Confermare o correggere il confine tra stanza condivisa e continuity personale.
2. Scegliere se partire dalla baseline a due Responses separate o sperimentare prima la Beta Multi-agent.
3. Proporre lo stack minimo del backend.
4. Indicare rischi che Tessa non ha coperto.
5. Se approva il gate, definire con Tessa il primo vertical slice implementabile.

## Fonti tecniche verificate da Tessa

- OpenAI API overview: Responses per richieste/stateful interactions; Realtime per sessioni low-latency voce/audio.
- OpenAI API authentication: chiavi segrete solo server-side.
- Responses streaming: `stream=true` emette eventi server-sent durante la generazione.
- API reference corrente: presente una superficie Beta `Responses (Multi-agent)` con streaming events associati a `agent_name`.

Verifica effettuata il 2026-09-18; trattare la superficie Beta come soggetta a cambiamento.
