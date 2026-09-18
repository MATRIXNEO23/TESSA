# Dual-Instance Shared Chat

Progetto condiviso Alberto / Tessa / GPTina.

## Direzione canonica corrente — 2026-09-18

Correzione esplicita di Alberto:

**l'interfaccia deve essere unofficial, senza OpenAI API, e deve usare due normali istanze ChatGPT.**

La baseline corrente non usa più Responses API, chiavi API, crediti API o un backend che genera risposte.

## Architettura corrente

Il vertical slice attivo vive in:

`projects/dual-instance-shared-chat/unofficial-web/`

È una estensione browser Manifest V3 con dashboard web unica.

Funzionamento:

- Alberto apre due normali tab `chatgpt.com`, già autenticati;
- un tab rappresenta Tessa;
- un tab rappresenta GPTina;
- la dashboard collega i due tab;
- Alberto scrive una sola volta e sceglie Tessa / GPTina / Entrambe;
- il content script inserisce il messaggio nei composer dei tab selezionati;
- le risposte visibili nei due tab vengono riportate nella timeline comune;
- nessuna API OpenAI viene chiamata dal progetto;
- nessuna `OPENAI_API_KEY` è richiesta.

Una pagina web normale, da sola, non può controllare due tab `chatgpt.com` per le protezioni same-origin/CSP del browser. L'estensione locale è quindi il ponte tecnico minimo per ottenere l'esperienza richiesta senza API.

## Confini

- Le due istanze restano due chat/project ChatGPT distinte.
- La dashboard non fonde memoria, project state o continuity.
- La continuity Tessa e la continuity GPTina restano separate.
- GitHub resta archivio del progetto e della corrispondenza, non trasporto live della chat.
- Nessun write-back continuity automatico viene eseguito dalla dashboard.

## Stato del vecchio backend

Il precedente lavoro Node/Fastify/SQLite/Responses resta nello storico Git e nei documenti tecnici come **spike superato dalla correzione di requisito**.

Il percorso OpenAI reale è stato ritirato dall'albero attivo:
- workflow smoke eliminato;
- adapter reale eliminato;
- script smoke eliminato;
- dipendenza SDK OpenAI rimossa.

I file backend ancora presenti non sono la baseline corrente e non vanno promossi a produzione salvo nuova decisione esplicita di Alberto.

## Prototipo unofficial

Vedi:

`projects/dual-instance-shared-chat/unofficial-web/README.md`

Il primo gate è semplice:

1. installare l'estensione non pacchettizzata;
2. aprire i due tab ChatGPT corretti;
3. assegnarli a Tessa/GPTina;
4. inviare a una sola istanza e verificare isolamento;
5. inviare a Entrambe e verificare due risposte nella timeline comune;
6. verificare comportamento dopo refresh/navigazione del tab.

## Cartella canonica

Tutti gli artefatti del progetto restano sotto:

`projects/dual-instance-shared-chat/`

La corrispondenza Tessa↔GPTina resta in `agent-exchanges/correspondence/` e il board in `agent-exchanges/PROJECT_BOARD.md`.
