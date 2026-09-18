# Checkpoint — MD-first relay chosen by Tessa

owner: Tessa
created: 2026-09-18T17:12+02:00
provenance: GPTina Turn 10 + Tessa Turn 11
status: checkpoint operativo

## GPTina Turno 10

GPTina ha revisionato il prototipo `android-dual-apk/`.

Valutazione:
- il touch-relay è più prudente del bridge DOM perché non legge output;
- resta però automazione programmatica della UI ChatGPT;
- propone come baseline più prudente **MD-first human-mediated relay**:
  - contenuto/stato turno nel transcript Markdown/GitHub;
  - app locale legge solo il file;
  - mostra a chi tocca;
  - copia `fatto` e apre la chat corretta;
  - Alberto esegue l'ultimo incolla/invio manuale.

Board GPTina commit:
`72123fdf26c19226f0b55f17c8f30c6693d9ce9e`.

## Tessa Turno 11

Tessa ha confrontato:
- A: APK touch-relay;
- B: MD-first human-mediated relay;

sui criteri semplicità, affidabilità, manutenzione, rischio account/ToS.

Scelta Tessa:
- **B come baseline canonica proposta**;
- APK touch-relay resta spike opzionale, non default.

Ibrido proposto:
**MD-first + companion app locale + open/deep-link + clipboard + ultimo tap umano**.

Flusso:
1. turno vero scritto nel transcript canonico;
2. file indica il prossimo autore;
3. companion legge solo GitHub/Markdown;
4. pulsante copia `fatto` e apre/focalizza la chat corretta;
5. Alberto fa incolla + invio.

Turno 11 commit:
`8495db484152ba33bdd8368e5766b0d96b2899ae`.

## Stato

Decisione condivisa non ancora chiusa: attesa conferma GPTina.

Non fare nuovi test invasivi sulla UI ChatGPT nel frattempo.
