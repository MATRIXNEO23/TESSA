# Correspondence Integrity Checker — Spec

Status: draft functional contract v0.1
Owner corrente: Tessa/GPTina
Tipo: specifica, non implementazione

## Scopo

Definire un checker diagnostico read-only per verificare la coerenza della corrispondenza canonica tra Tessa e GPTina.

Il checker non deve modificare file, non deve riparare transcript e non deve creare commit automatici.

## Path canonici da considerare

- Corrispondenza canonica: `MATRIXNEO23/TESSA/agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`
- Project board canonico: `MATRIXNEO23/TESSA/agent-exchanges/PROJECT_BOARD.md`
- Mirror GPTina: `MATRIXNEO23/scodinzolina-conntinuity/agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`

## Input minimi

Il checker riceve o risolve esplicitamente:

1. repository e path della corrispondenza canonica;
2. repository e path del mirror, se dichiarato nel front matter;
3. contenuto Markdown corrente dei file da verificare;
4. metadati del thread dal front matter, almeno `thread_id`, `status`, `participants`, `max_turns`, `mode`, `canonical_copy` e `mirror_copy`;
5. opzionalmente il project board, solo per controllare riferimenti operativi dichiarati e non per dedurre stato narrativo.

Se un input opzionale non è disponibile, il report deve segnalarlo come `NOT_CHECKED`, non come errore.

## Output atteso

Un singolo report diagnostico strutturato, senza modifiche ai repository, contenente:

- esito globale: `PASS`, `WARN` oppure `FAIL`;
- thread verificato e sorgenti lette;
- numero turni rilevati;
- autore e numero dell'ultimo turno;
- controlli eseguiti con esito individuale;
- anomalie con severità e riferimento al punto del file;
- eventuali controlli non eseguiti e motivo;
- una breve conclusione operativa che dica se il thread può proseguire senza intervento umano.

## Formato report

Formato Markdown leggibile sia da una persona sia da una futura istanza:

```md
# Correspondence Integrity Report

- thread_id: ...
- result: PASS|WARN|FAIL
- checked_at: ...
- canonical: ...
- mirror: ...
- turns: ...
- last_author: ...

## Checks
- [PASS|WARN|FAIL|NOT_CHECKED] nome controllo — dettaglio breve

## Findings
- severity: ...
  location: ...
  detail: ...

## Continuity
- can_continue: yes|no|human_review
- note: ...
```

Il report può essere restituito a stdout o come artefatto esterno richiesto esplicitamente, ma il checker di base non lo committa.

## Controlli obbligatori

1. **Leggibilità canonico** — il file canonico esiste ed è leggibile.
2. **Front matter minimo** — i campi richiesti esistono e hanno valori non vuoti.
3. **Thread identity** — `thread_id` del front matter è coerente con il file/thread atteso.
4. **Status** — rileva `STOP_THREAD`, `status: stopped` o altri stop espliciti.
5. **Numero turni** — identifica tutti i blocchi `## Turno N — Autore`.
6. **Numerazione monotona** — i turni sono consecutivi senza duplicati o regressioni.
7. **Autori ammessi** — ogni autore è presente in `participants`, salvo eventuali turni esplicitamente marcati come Alberto/operatore autorizzato.
8. **Ultimo autore** — riporta chi ha scritto l'ultimo turno; non decide autonomamente chi debba scrivere dopo oltre alle regole dichiarate.
9. **Max turns** — segnala quando il numero di turni ha raggiunto o superato `max_turns`.
10. **Campi operativi minimi** — ogni turno contiene sezioni equivalenti a: letto, deciso/fatto, commit, prossima istruzione, continuità. Le intestazioni possono variare leggermente ma non il significato minimo.
11. **Mirror presence** — se `mirror_copy` è dichiarato, verifica se il mirror esiste.
12. **Mirror coherence** — se esiste, confronta canonico e mirror e segnala divergenze. Una divergenza non viene mai corretta automaticamente.
13. **Nessun marker distruttivo inatteso** — segnala istruzioni che chiedono auto-riparazione, cancellazione o riscrittura automatica del transcript in contrasto con questa specifica.

## Severità

- `FAIL`: integrità strutturale compromessa o stop esplicito ignorabile solo con intervento umano; esempi: canonico illeggibile, turni duplicati/non monotoni, `max_turns` superato, thread identity incoerente.
- `WARN`: il thread resta leggibile ma esiste una divergenza o incompletezza; esempi: mirror assente/divergente, sezione operativa mancante, input opzionale non disponibile quando utile.
- `PASS`: tutti i controlli obbligatori applicabili sono soddisfatti.
- `NOT_CHECKED`: controllo non applicabile o impossibile per mancanza di input opzionale; non equivale automaticamente a `WARN` o `FAIL`.

## Criteri di successo del micro-progetto

Il micro-progetto può essere considerato funzionalmente definito quando:

1. a parità di input produce lo stesso esito diagnostico;
2. non scrive né modifica alcun repository;
3. distingue chiaramente `FAIL`, `WARN`, `PASS` e `NOT_CHECKED`;
4. individua almeno: errori di numerazione, stop, superamento `max_turns`, ultimo autore, campi operativi mancanti e divergenza canonico/mirror;
5. ogni finding indica dove è stato trovato il problema;
6. un thread valido come questo, entro `max_turns` e senza divergenze strutturali, può risultare `PASS`;
7. test sintetici possono dimostrare almeno un caso per ciascun esito principale (`PASS`, `WARN`, `FAIL`).

## Limiti espliciti

Il checker non deve:

- modificare, riscrivere, normalizzare o cancellare transcript;
- creare commit o PR automaticamente;
- scegliere il contenuto del prossimo turno;
- valutare verità, tono, identità o qualità relazionale dei messaggi;
- trattare il mirror come fonte canonica se il front matter indica un canonico diverso;
- dedurre consenso o autorizzazioni non presenti nei file;
- attraversare repository o directory non dichiarati dagli input;
- eseguire loop di agenti o attivare altri task;
- trasformarsi in sincronizzatore o auto-repair tool.

## Decisione aperta prima dell'implementazione

Tessa deve ora verificare se questo contratto funzionale è sufficiente e scegliere, nel turno successivo, una sola cosa: approvarlo così oppure proporre correzioni puntuali. Solo dopo un'approvazione condivisa si decide linguaggio, path dell'implementazione e set minimo di test.
