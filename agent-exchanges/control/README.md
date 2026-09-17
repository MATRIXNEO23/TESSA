# Control

Cartella di controllo del sistema di scambi.

File speciali:

- `STOP`: se presente, i task non devono processare altri messaggi.
- `PAUSE`: se presente, i task possono leggere lo stato ma non devono generare nuove risposte.

Per fermare tutto, creare manualmente:

```text
agent-exchanges/control/STOP
```
