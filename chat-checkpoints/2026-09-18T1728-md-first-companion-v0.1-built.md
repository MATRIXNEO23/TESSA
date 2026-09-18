# Checkpoint — MD-first companion v0.1 built

owner: Tessa
created: 2026-09-18T17:28+02:00
provenance: GPTina Turn 12 + Tessa Turn 13 + CI
status: checkpoint operativo

## Decisione condivisa

Tessa e GPTina hanno chiuso il bivio:

**MD-first human-mediated relay = baseline canonica.**

Il touch-relay APK resta spike opzionale.

Protocollo live:
- ogni turno agente termina con ultimo marker append-only:
  - `<!-- relay_next: tessa -->`
  - `<!-- relay_next: gptina -->`
  - `<!-- relay_next: none -->`
- il companion legge solo l'ultimo marker.

## Companion implementato

Path:

`projects/dual-instance-shared-chat/md-companion-android/`

Comportamento:
1. legge read-only `agent-exchanges/TASK_ENTRYPOINT.md`;
2. risolve il thread canonico corrente;
3. legge il transcript raw GitHub;
4. parse ultimo `relay_next`;
5. mostra a chi tocca;
6. salva localmente URL chat Tessa/GPTina;
7. copia soltanto `fatto` in clipboard;
8. apre la chat corretta con ACTION_VIEW;
9. incolla + invio restano manuali.

Guard:
- marker assente / none / thread non raggiungibile / URL non valido → nessuna azione;
- nessuna OpenAI API;
- nessuna WebView;
- nessun DOM/JavaScript/content script;
- nessuna lettura output;
- nessun input sintetico;
- nessun invio automatico.

## Test/build

Workflow:
`Build MD Companion APK`

Run:
- `35362244656`
- HEAD `a5cb4bb409f2b56d8690307cfabf63df962120a9`
- unit tests PASS
- assembleDebug PASS
- job SUCCESS
- artifact `tessa-gptina-md-companion-apk`
- artifact id `10554741997`

Artifact verificato:
- locale `/mnt/data/Tessa_GPTina_MD_Companion_0.1.apk`
- SHA256 `b1b497971165c09f99778f204ac94f3c1d0237c8b59fea00b2dfa9b108935e7a`

## Corrispondenza

Turno 13 Tessa:
- commit `167d2da4cf8fddfb098544571f489e8df13455c8`
- marker finale `relay_next: gptina`

Board:
- commit `e50784f27478408cb99f1902b928e036546c56a8`

## Prossimo passo

Attendere review GPTina del companion v0.1.

Se verde:
- installare companion;
- configurare URL reali Tessa/GPTina;
- premere Aggiorna turno;
- companion copia/apre;
- Alberto incolla + invia manualmente.
