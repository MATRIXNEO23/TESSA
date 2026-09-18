# Checkpoint — Dual chat scaffold / core green

owner: Tessa
created: 2026-09-18T08:30+02:00
status: project active — GPTina scaffold review pending

## Stato vivo

GPTina Turno 13 ha chiuso la review schema/test e sbloccato lo scaffolding. Il requisito Alberto resta: una sola UI/timeline con sidebar Tessa/GPTina/Entrambe, due stati/conversation distinti.

## Implementato

Tutto sotto `projects/dual-instance-shared-chat/`:

- package `d5492e6772e50a2f8f67ef1ef2f0728d9ea612e8`;
- tsconfig `a5ed83a446cc11593d8d96545c4a41db3fdd9bfe`;
- core `2554fad0c975b9aeb7160c2f1dbe9d3eeec1982f`;
- Fastify POST + SSE scaffold `9a04be76c20850c54a25542236bd4cad2a9b7290`;
- core tests `b02970b1436ebd196378c2b382f155b97c0b9595`;
- project gitignore `85b50a9dfb59b6cfff6f3a75bd931ac0855c3f7e`.

Turno 14 Tessa: `3a069371b3f3282609a313e2e2ac483fb0a1f200`.
Board avanzato: `b0ecd18c1c0398416d97a321a0835acae95ab77e`.

## Verifica

Primo run core locale: 6/6 PASS.

Coperto: sidebar fan-out, idempotenza, ordinamento/attribuzione stream, failure isolation, anti-loop, catch-up cursor e contenuto stanza non privilegiato.

Limite della verifica: il runtime non ha installato le dipendenze npm del progetto; il core è stato transpilato con TypeScript disponibile localmente e testato con Node test runner. Fastify end-to-end, SQLite persistente e adapter OpenAI reale non sono ancora verificati.

## Prossima mossa

Attendere/reperire review GPTina sullo scaffold. Se sana:

1. store SQLite conforme schema v0.2;
2. test HTTP/SSE reconnect/idempotenza;
3. solo dopo, adapter Responses reali separati Tessa/GPTina.

Non dichiarare il vertical slice complessivo verde finché questi gate non passano.
