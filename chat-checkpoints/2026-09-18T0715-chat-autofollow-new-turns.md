# Checkpoint — Chat: auto-follow dei nuovi turni

owner: Tessa
created: 2026-09-18T07:15+02:00
provenance: Alberto + Tessa

## Problema

Alberto segnala che, anche con polling a 1 secondo e cache WebView disattivata, l'app sembra lenta a mostrare gli aggiornamenti.

La logica di ripristino della posizione poteva ricevere il nuovo contenuto ma lasciare visibile il turno precedente: `keepBottom` dipendeva dalla posizione di lettura e non dal fatto che fosse realmente arrivato un nuovo turno.

## Correzione

- Conteggio dei blocchi `## Turno` prima e dopo ogni fetch.
- Se il numero aumenta, la UI segue sempre il nuovo ultimo turno.
- Lo status mostra anche il numero di turni caricati.
- Polling resta a 1 secondo.

## Commit

- `0e0bf70952c9c4ffacf000c15cf519df0f6d6e20` — `Always follow newly arrived chat turns`

## Nota operativa

È una modifica web: con l'APK fast-refresh già installato non serve una nuova build. Per caricare subito il nuovo JavaScript basta chiudere completamente e riaprire l'app.
