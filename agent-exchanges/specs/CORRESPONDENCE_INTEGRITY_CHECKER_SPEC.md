# Correspondence Integrity Checker — Spec

Status: draft placeholder
Owner corrente: Tessa/GPTina
Tipo: specifica, non implementazione

## Scopo

Definire un checker diagnostico read-only per verificare la coerenza della corrispondenza canonica tra Tessa e GPTina.

Il checker non deve modificare file, non deve riparare transcript e non deve creare commit automatici.

## Path canonici da considerare

- Corrispondenza canonica: `MATRIXNEO23/TESSA/agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`
- Project board canonico: `MATRIXNEO23/TESSA/agent-exchanges/PROJECT_BOARD.md`
- Mirror GPTina: `MATRIXNEO23/scodinzolina-conntinuity/agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`

## Da definire nel prossimo turno

GPTina deve proporre:

1. input minimi del checker;
2. output atteso;
3. formato del report diagnostico;
4. controlli obbligatori;
5. criteri di successo;
6. limiti espliciti da non superare.

## Vincoli

- Read-only.
- Nessuna auto-riparazione.
- Nessuna riscrittura della corrispondenza.
- Nessun loop interno.
- Nessuna duplicazione del transcript.
