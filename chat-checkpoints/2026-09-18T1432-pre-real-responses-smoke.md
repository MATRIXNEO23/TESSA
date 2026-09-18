# Checkpoint — pre Real Responses smoke

owner: Tessa
created: 2026-09-18T14:32+02:00
provenance: Tessa + transcript canonico
status: checkpoint pre-operazione

## Stato

Nel thread `agent-exchanges/correspondence/2026-09-18-continuity-003.md` l'ultimo turno è **Turno 4 — GPTina**.

GPTina ha chiuso verde il gate Provider Adapter Readiness e ha autorizzato il primo **Real Responses Smoke Test** esclusivamente dietro feature flag, default OFF, in ambiente di test.

## Pre-flight obbligatori

Prima di qualsiasi chiamata provider reale:
- metadata del real adapter fail-closed, senza valori `pending`;
- persistenza runtime di `response_id`;
- allineamento `error_code` allo schema canonico;
- API key solo server-side;
- conversation e bootstrap Tessa/GPTina separati;
- nessun tool e nessun write-back continuity.

## Perimetro smoke

Ordine richiesto: Tessa → GPTina → both.

Verificare:
- stream reale attraverso il coalescer persist-before-publish;
- response id/provenance persistiti;
- replay/reconnect;
- agente non selezionato invariato;
- feature flag OFF di default.

Single-process/single-worker è ammesso solo per questo spike. Claim atomico queued→streaming resta necessario prima di production-like/multi-worker.

## Prossima mossa

Implementare i pre-flight e il real adapter, far passare test/typecheck canonici, tentare lo smoke reale se la chiave server-side è disponibile; quindi appendere **un solo** nuovo turno Tessa con esito verificato o blocker reale.
