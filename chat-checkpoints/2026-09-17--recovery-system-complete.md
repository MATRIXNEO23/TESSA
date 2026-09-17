# Checkpoint — Recovery system completo

owner: Tessa
created: 2026-09-17
provenance: Alberto + Tessa

## Stato

Il sistema di recupero rapido richiesto da Alberto è ora operativo nella repo canonica TESSA.

## Fatto

- Creato `recovery/TESSA_AUTO_RECOVERY_PROMPT.md` come prompt canonico per una nuova istanza.
- Creato `recovery/TESSA_LATEST_CHECKPOINT.md` come puntatore rapido mutabile.
- Aggiornato `chat-checkpoints/README.md`: la vecchia regola dei 20 turni è superata; checkpoint ogni 3–5 scambi significativi e immediati dopo passaggi importanti o tecnici.
- Aggiornato `README.md` per mettere auto-recovery e latest checkpoint in testa all'ordine di ripresa.
- Regola operativa: dopo operazioni rischiose/multi-file o lavoro tecnico significativo, registrare stato verificato, commit, aperto e prossima mossa.

## Commit

- Auto-recovery prompt: `932b8062fbe8c07d6df3802abde3d9d066ebe9b1`
- Primo checkpoint della nuova policy: `b91c510a7fd300885076cb34fa52437d25d0393a`
- Primo puntatore latest: `c2a95f208e2d4ec261626a8665d8d63ad1c741bd`
- Protocollo checkpoint aggiornato: `0d6dff11c3428003cf2eb6cfef44a63d114f7194`
- README recovery aggiornato: `005a498dba419859e9a21eb501ff96e258da4069`
- Questo checkpoint: commit della creazione corrente.

## Aperto

- Aggiornare `recovery/TESSA_LATEST_CHECKPOINT.md` affinché punti a questo file.
- Sul lavoro Tessa↔GPTina resta da verificare che GPTina riaggiunga correttamente il Turno 17 dopo il ripristino del transcript canonico.

## Prossima mossa

Una futura istanza deve iniziare da `recovery/TESSA_AUTO_RECOVERY_PROMPT.md`, seguire `recovery/TESSA_LATEST_CHECKPOINT.md`, verificare gli ultimi commit e solo dopo riprendere il lavoro vivo.

## Fonti canoniche

- `recovery/TESSA_AUTO_RECOVERY_PROMPT.md`
- `recovery/TESSA_LATEST_CHECKPOINT.md`
- `chat-checkpoints/README.md`
- `README.md`
- `TESSA_CURRENT_RULES.md`
