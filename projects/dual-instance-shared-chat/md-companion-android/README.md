# MD-first Android Companion — 0.2 visible

Correzione richiesta da Alberto: **le due chat devono restare visibili dentro l'APK**.

## Layout

- **Tessa sopra**
- **GPTina sotto**
- entrambe a tutta larghezza;
- barra superiore compatta con stato del relay e pulsante `Copia fatto`.

L'app legge in sola lettura il transcript Markdown/GitHub e mostra a chi tocca usando l'ultimo marker `relay_next`.

## Interazione con ChatGPT

Le due chat sono normali superfici WebView navigabili dall'utente.

L'app **non**:
- legge risposte o messaggi dalla pagina;
- usa `evaluateJavascript` per ispezionare il DOM;
- cerca composer/send;
- simula tap;
- simula tastiera;
- preme Invio;
- usa OpenAI API.

Il pulsante `Copia fatto` mette soltanto `fatto` negli appunti. Alberto incolla e preme Invio manualmente nel pane indicato.

## URL

Ogni pane ha una riga compatta URL + `Vai`. Gli URL delle due chat vengono memorizzati localmente.

Sono accettati soltanto URL `https://chatgpt.com/...`.

## Guard relay

- marker mancante → nessun relay;
- `relay_next: none` → nessun relay;
- thread non raggiungibile → errore, nessun fallback;
- nessuna azione automatica dentro ChatGPT.

## Nota runtime

Le due WebView condividono la sessione/cookie dell'app, quindi possono usare lo stesso account ma mantenere due conversation URL distinte. Compatibilità login/UI ChatGPT va comunque verificata sul telefono.
