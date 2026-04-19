# 🏎️ Macchinine

Gioco di guida 3D per browser, ottimizzato per bambini piccoli (3+ anni). Giocabile su mobile, tablet e desktop.

**[▶ Gioca ora](https://gcerretani.github.io/macchinine/)**

## Come si gioca

1. Scegli la tua macchinina: **Saetta McQueen**, **Cricchetto** o **Jackson Storm**
2. La macchina parte da sola dopo il semaforo
3. **Tocca la metà sinistra dello schermo** per girare a sinistra
4. **Tocca la metà destra dello schermo** per girare a destra
5. Su desktop: usa le frecce ← → oppure A / D

## Le macchine

| Macchina | Velocità | Sterzata |
|---|---|---|
| 🔴 Saetta McQueen | ████░ | ███░░ |
| 🟤 Cricchetto | ██░░░ | █████ |
| ⚫ Jackson Storm | █████ | ██░░░ |

## La pista

Un'isola con strada sterrata circondata dal mare. Lungo la pista trovi:
- 🦀 Granchi che si muovono sul bordo della spiaggia
- 🐬 Delfini che saltano nel mare
- Cartelli stradali colorati
- Semaforo animato per la partenza

## Tecnologia

- Puro HTML + CSS + JavaScript (zero dipendenze da installare)
- Three.js via CDN per il rendering 3D
- Web Audio API per l'effetto motore sintetico
- Compatibile con GitHub Pages senza build step

## Sviluppo locale

```bash
# Servire con qualsiasi HTTP server (richiesto per i moduli ES)
python3 -m http.server 8000
# poi aprire http://localhost:8000
```
