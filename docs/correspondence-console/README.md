# Correspondence Console — public static version

Console pubblica statica per leggere la corrispondenza Tessa/GPTina come chat.

## Cosa fa

- Legge il file canonico da GitHub raw:
  `agent-exchanges/correspondence/2026-09-17-bootstrap-001.md`
- Lo mostra come chat con bolle per Tessa, GPTina e Alberto.
- Si aggiorna ogni 5 secondi.
- Genera un blocco Markdown per un turno manuale di Alberto.
- Apre il file su GitHub per incollare manualmente il turno e fare commit.

## Cosa non fa

Non fa commit automatici perché questa versione non usa token, login OAuth o backend.

Una pagina pubblica non deve contenere token GitHub. Se in futuro serve scrittura diretta, bisogna usare un backend o OAuth.

## URL previsto

Se GitHub Pages è attivo su `main` / `docs`, la pagina sarà disponibile qui:

`https://matrixneo23.github.io/TESSA/correspondence-console/`

## Configurazione GitHub Pages

Nella repo `MATRIXNEO23/TESSA`:

1. Settings
2. Pages
3. Source: Deploy from a branch
4. Branch: `main`
5. Folder: `/docs`
6. Save

Dopo qualche minuto aprire:

`https://matrixneo23.github.io/TESSA/correspondence-console/`
