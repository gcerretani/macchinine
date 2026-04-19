# CLAUDE.md — Macchinine

## Panoramica progetto

Gioco di guida 3D in-browser per bambini (3+ anni), deployato su GitHub Pages. Nessun build step, nessuna dipendenza npm — tutto vanilla JS con Three.js via CDN.

## Struttura file

```
index.html          ← entry point unico (selezione macchina + schermata gioco)
css/style.css       ← stili UI (selection screen, HUD, touch zones)
js/
  main.js           ← bootstrap: selezione macchina, preview 3D, navigazione schermate
  game.js           ← Game class: Three.js scene, loop, camera, countdown, conteggio giri
  car.js            ← Car class: fisica (auto-accel, sterzo, recupero pista)
  track.js          ← buildWorld(): isola, pista sterrata, mare, palme; animateSea()
  decorations.js    ← buildDecorations(): granchi, delfini, cartelli, semaforo
  input.js          ← Input class: tastiera (← →, A/D) + touch (left/right half-screen)
  audio.js          ← EngineAudio: Web Audio API, oscillatore sawtooth + square
  cars/
    mcqueen.js      ← buildMcQueen(): Saetta McQueen in geometrie Three.js
    storm.js        ← buildStorm(): Jackson Storm
    mater.js        ← buildMater(): Cricchetto (carro attrezzi)
```

## Architettura di gioco

- **Rendering**: Three.js r160 ES modules via CDN (`importmap` in `index.html`)
- **Fisica**: top-down semplificata — auto-accel, sterzo a heading, push-back automatico se fuori pista
- **Track**: ellisse parametrica (rx=55, rz=35); `nearestTrackPoint()` in `track.js` per la collision
- **Giri**: rilevati tracciando l'angolo parametrico della posizione car sull'ellisse (atan2)
- **Camera**: terza persona, lerp morbido, posizionata dietro la macchina in base a `car.heading`

## Parametri macchine (`car.js`)

```js
mcqueen: { maxSpeed: 28, accel: 14, steerSpeed: 1.8 }
storm:   { maxSpeed: 34, accel: 18, steerSpeed: 1.2 }
mater:   { maxSpeed: 20, accel: 10, steerSpeed: 2.4 }
```

## Comandi utili

```bash
# Sviluppo locale (i moduli ES richiedono un HTTP server)
python3 -m http.server 8000

# Deploy: push su main → GitHub Pages pubblica automaticamente
git push origin main
```

## Note importanti

- Il file `.nojekyll` nella root è obbligatorio per GitHub Pages (disabilita Jekyll che interferisce con i moduli ES)
- Nessun `node_modules`, nessun bundler — aggiungere dipendenze solo via CDN nell'importmap di `index.html`
- I canvas texture (decalcomanie macchine, cartelli) sono generati al volo con Canvas 2D API — nessun asset esterno
- L'audio parte solo al click/tap (browser policy) — `EngineAudio.start()` va chiamato in risposta a un evento utente
