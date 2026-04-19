import * as THREE from 'three';
import { TRACK } from './track.js';

export function buildDecorations() {
  const group = new THREE.Group();
  const crabs = [];
  const dolphins = [];
  const trafficLight = buildTrafficLight();

  // Crabs on the beach (around island edge)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + 0.2;
    const rx = TRACK.rx + TRACK.islandPadding - 2;
    const rz = TRACK.rz + TRACK.islandPadding - 2;
    const crab = buildCrab();
    crab.position.set(Math.cos(angle) * rx, 0.1, Math.sin(angle) * rz);
    crab.rotation.y = Math.random() * Math.PI * 2;
    crab.userData.baseX = crab.position.x;
    crab.userData.baseZ = crab.position.z;
    crab.userData.phase = Math.random() * Math.PI * 2;
    crabs.push(crab);
    group.add(crab);
  }

  // Dolphins in the sea
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
    const r = 90 + Math.random() * 40;
    const dolphin = buildDolphin();
    dolphin.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    dolphin.rotation.y = angle + Math.PI / 2;
    dolphin.userData.phase = Math.random() * Math.PI * 2;
    dolphin.userData.speed = 0.5 + Math.random() * 0.5;
    dolphins.push(dolphin);
    group.add(dolphin);
  }

  // Road signs along the track (outside edge)
  const signMessages = ['BRUM!', 'CURVA', 'PIANO', 'VAI!', 'YUPPI', 'SVOLTA'];
  for (let i = 0; i < signMessages.length; i++) {
    const angle = (i / signMessages.length) * Math.PI * 2;
    const r = 1 + 0.05;
    const sx = Math.cos(angle) * (TRACK.rx + TRACK.width / 2 + 2);
    const sz = Math.sin(angle) * (TRACK.rz + TRACK.width / 2 + 2);
    const sign = buildSign(signMessages[i]);
    sign.position.set(sx, 0, sz);
    sign.rotation.y = -angle + Math.PI / 2;
    group.add(sign);
  }

  // Traffic light at the start/finish line
  trafficLight.position.set(TRACK.rx + TRACK.width / 2 + 2, 0, 0);
  trafficLight.rotation.y = -Math.PI / 2;
  group.add(trafficLight);

  // Finish line stripe (black/white checker)
  const checkGeo = new THREE.PlaneGeometry(TRACK.width, 1.5);
  checkGeo.rotateX(-Math.PI / 2);
  const checkCanvas = document.createElement('canvas');
  checkCanvas.width = 128; checkCanvas.height = 32;
  const ctx = checkCanvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 128, 32);
  ctx.fillStyle = '#000';
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 8; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * 16, y * 16, 16, 16);
    }
  }
  const checkTex = new THREE.CanvasTexture(checkCanvas);
  const checkMat = new THREE.MeshLambertMaterial({ map: checkTex });
  const checkLine = new THREE.Mesh(checkGeo, checkMat);
  checkLine.position.set(TRACK.rx, 0.06, 0);
  checkLine.rotation.y = -Math.PI / 2;
  group.add(checkLine);

  return { group, crabs, dolphins, trafficLight };
}

function buildCrab() {
  const crab = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), bodyMat);
  body.scale.set(1, 0.5, 0.9);
  body.position.y = 0.2;
  crab.add(body);

  // Eyes
  for (let i = -1; i <= 1; i += 2) {
    const eyeStalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.2, 6),
      new THREE.MeshLambertMaterial({ color: 0xe74c3c })
    );
    eyeStalk.position.set(i * 0.12, 0.42, 0.15);
    crab.add(eyeStalk);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    eye.position.set(i * 0.12, 0.52, 0.15);
    crab.add(eye);
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    pupil.position.set(i * 0.12, 0.52, 0.21);
    crab.add(pupil);
  }

  // Claws
  for (let i = -1; i <= 1; i += 2) {
    const claw = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 6),
      bodyMat
    );
    claw.scale.set(1, 0.6, 0.7);
    claw.position.set(i * 0.5, 0.2, 0.25);
    crab.add(claw);
  }

  // Legs
  for (let side = -1; side <= 1; side += 2) {
    for (let j = 0; j < 3; j++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.3, 5),
        bodyMat
      );
      leg.position.set(side * 0.35, 0.05, -0.15 + j * 0.1);
      leg.rotation.z = side * 0.6;
      crab.add(leg);
    }
  }

  return crab;
}

function buildDolphin() {
  const dolphin = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: 0x7b9cbf });
  const bellyMat = new THREE.MeshLambertMaterial({ color: 0xdce9f5 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat);
  body.scale.set(2.2, 0.9, 0.9);
  dolphin.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 8), bellyMat);
  belly.scale.set(2, 0.5, 0.8);
  belly.position.y = -0.2;
  dolphin.add(belly);

  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), mat);
  snout.rotation.z = -Math.PI / 2;
  snout.position.x = 2.2;
  dolphin.add(snout);

  const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 4), mat);
  dorsal.position.set(-0.2, 0.7, 0);
  dorsal.rotation.x = Math.PI / 6;
  dolphin.add(dorsal);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 4), mat);
  tail.rotation.z = Math.PI / 2;
  tail.scale.set(1, 1, 0.2);
  tail.position.x = -2.3;
  dolphin.add(tail);

  dolphin.scale.setScalar(1.2);
  return dolphin;
}

function buildSign(text) {
  const group = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8),
    new THREE.MeshLambertMaterial({ color: 0x7a4a28 })
  );
  pole.position.y = 1.1;
  group.add(pole);

  // Board with text drawn on canvas texture
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff6c7';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = '#5a2f0a';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 118);
  ctx.fillStyle = '#c0392b';
  ctx.font = 'bold 72px Comic Sans MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 70);
  const tex = new THREE.CanvasTexture(canvas);

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.9, 0.1),
    [
      new THREE.MeshLambertMaterial({ color: 0xfff6c7 }),
      new THREE.MeshLambertMaterial({ color: 0xfff6c7 }),
      new THREE.MeshLambertMaterial({ color: 0xfff6c7 }),
      new THREE.MeshLambertMaterial({ color: 0xfff6c7 }),
      new THREE.MeshLambertMaterial({ map: tex }),
      new THREE.MeshLambertMaterial({ map: tex }),
    ]
  );
  board.position.y = 2.1;
  group.add(board);

  return group;
}

function buildTrafficLight() {
  const group = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3.5, 8),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
  );
  pole.position.y = 1.75;
  group.add(pole);

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 2, 0.5),
    new THREE.MeshLambertMaterial({ color: 0x2c3e50 })
  );
  box.position.y = 3.8;
  group.add(box);

  const lights = [];
  const colors = [0x550000, 0x555500, 0x004400];
  const brightColors = [0xff2222, 0xffee00, 0x22dd44];
  for (let i = 0; i < 3; i++) {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 10),
      new THREE.MeshBasicMaterial({ color: colors[i] })
    );
    light.position.set(0, 4.4 - i * 0.6, 0.28);
    light.userData.dim = colors[i];
    light.userData.bright = brightColors[i];
    lights.push(light);
    group.add(light);
  }

  group.userData.lights = lights;
  return group;
}

export function animateDecorations(decorations, time) {
  // Crabs: sidestep oscillation
  for (const crab of decorations.crabs) {
    const phase = crab.userData.phase;
    const offset = Math.sin(time * 2 + phase) * 0.15;
    crab.position.x = crab.userData.baseX + offset;
    crab.position.y = 0.1 + Math.abs(Math.sin(time * 4 + phase)) * 0.05;
  }

  // Dolphins: swim around and jump
  for (const dolphin of decorations.dolphins) {
    const phase = dolphin.userData.phase;
    const speed = dolphin.userData.speed;
    const orbit = time * 0.08 * speed + phase;
    const r = 95 + Math.sin(phase * 3) * 25;
    dolphin.position.x = Math.cos(orbit) * r;
    dolphin.position.z = Math.sin(orbit) * r;
    dolphin.rotation.y = -orbit + Math.PI / 2;
    const jump = Math.max(0, Math.sin(time * 2 + phase * 2));
    const jumpCurve = Math.pow(jump, 0.5);
    dolphin.position.y = -1 + jumpCurve * 3;
    dolphin.rotation.z = Math.cos(time * 2 + phase * 2) * 0.4;
  }
}

export function setTrafficLightStep(trafficLight, step) {
  const lights = trafficLight.userData.lights;
  for (let i = 0; i < 3; i++) {
    lights[i].material.color.setHex(
      i === step ? lights[i].userData.bright : lights[i].userData.dim
    );
  }
}
