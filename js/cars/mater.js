import * as THREE from 'three';

function makeRustTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  // Rust base
  ctx.fillStyle = '#8a5a3b';
  ctx.fillRect(0, 0, 256, 256);
  // Random rust patches (darker)
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 5 + Math.random() * 25;
    ctx.fillStyle = `rgba(${60 + Math.random() * 40},${30 + Math.random() * 30},${10 + Math.random() * 20},${0.3 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Celeste (light blue) paint remnants
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 10 + Math.random() * 20;
    ctx.fillStyle = `rgba(120, 170, 190, ${0.3 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Scratches
  for (let i = 0; i < 30; i++) {
    ctx.strokeStyle = `rgba(40,20,10,${0.4 + Math.random() * 0.4})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function buildMater() {
  const car = new THREE.Group();

  const rustTex = makeRustTexture();
  const bodyMat = new THREE.MeshLambertMaterial({ map: rustTex, color: 0xaa8866 });
  const darkRust = new THREE.MeshLambertMaterial({ color: 0x6b3c1e });
  const metal = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const darkMetal = new THREE.MeshLambertMaterial({ color: 0x444444 });

  // Cabin (tall, boxy, upright)
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.7, 2.1),
    bodyMat
  );
  cabin.position.set(0.5, 1.35, 0);
  car.add(cabin);

  // Windshield (rectangular, upright, high on cabin)
  const winMat = new THREE.MeshLambertMaterial({
    color: 0xb8d4e4, transparent: true, opacity: 0.75
  });
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.7, 1.6),
    winMat
  );
  windshield.position.set(1.42, 1.75, 0);
  car.add(windshield);

  // Side windows
  for (let side = -1; side <= 1; side += 2) {
    const sideWin = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.7, 0.08),
      winMat
    );
    sideWin.position.set(0.5, 1.75, side * 1.08);
    car.add(sideWin);
  }

  // Eyes - kind, cheerful, bulging
  const eyeWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const eyeDark = new THREE.MeshBasicMaterial({ color: 0x333333 });
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), eyeWhite);
    eye.position.set(1.55, 1.85, i * 0.4);
    eye.scale.set(0.6, 1, 1);
    car.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), eyeDark);
    // Looking up and slightly inward (bonario)
    pupil.position.set(1.72, 1.95, i * 0.3);
    car.add(pupil);
    const highlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    highlight.position.set(1.8, 2.02, i * 0.28);
    car.add(highlight);
  }

  // Front grille (dark, with teeth)
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.5, 1.5),
    darkMetal
  );
  grille.position.set(1.45, 0.95, 0);
  car.add(grille);

  // Buck teeth (3 irregular white teeth)
  const toothMat = new THREE.MeshLambertMaterial({ color: 0xf0e4c0 });
  const teethData = [
    { x: 1.5, y: 0.95, z: -0.3, s: [0.1, 0.3, 0.22] },
    { x: 1.52, y: 0.93, z: 0.0, s: [0.1, 0.35, 0.2] },
    { x: 1.5, y: 0.98, z: 0.3, s: [0.1, 0.28, 0.2] },
  ];
  for (const t of teethData) {
    const tooth = new THREE.Mesh(
      new THREE.BoxGeometry(...t.s),
      toothMat
    );
    tooth.position.set(t.x, t.y, t.z);
    tooth.rotation.z = (Math.random() - 0.5) * 0.3;
    car.add(tooth);
  }

  // Front bumper (massive, deformed)
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.35, 2.0),
    metal
  );
  bumper.position.set(1.55, 0.55, 0);
  bumper.rotation.z = 0.08;
  bumper.rotation.y = 0.05;
  car.add(bumper);
  // Dent on bumper
  const dent = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.25, 0.4),
    darkMetal
  );
  dent.position.set(1.45, 0.5, 0.6);
  car.add(dent);

  // Headlights (circular, sporgenti) - left working, right broken
  const lightWorkMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
  const lightBrokenMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const leftHl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), lightWorkMat);
  leftHl.position.set(1.6, 1.0, -0.65);
  leftHl.scale.set(0.6, 1, 1);
  car.add(leftHl);
  const rightHl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), lightBrokenMat);
  rightHl.position.set(1.58, 1.0, 0.65);
  rightHl.scale.set(0.6, 1, 1);
  rightHl.rotation.set(0.2, 0.1, 0.3);
  car.add(rightHl);

  // Rear cargo bed (flat, open)
  const cargoBed = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.35, 1.9),
    darkRust
  );
  cargoBed.position.set(-1.4, 0.7, 0);
  car.add(cargoBed);

  // Cargo bed walls
  const wallMat = darkRust;
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.12), wallMat);
  leftWall.position.set(-1.4, 1.0, 0.95);
  car.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.12), wallMat);
  rightWall.position.set(-1.4, 1.0, -0.95);
  car.add(rightWall);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 1.9), wallMat);
  backWall.position.set(-2.4, 1.0, 0);
  car.add(backWall);

  // Tow crane (articulated arm on back)
  const craneBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 1, 8),
    metal
  );
  craneBase.position.set(-2.2, 1.4, 0);
  car.add(craneBase);
  const craneArm = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.15, 0.15),
    metal
  );
  craneArm.position.set(-2.8, 1.85, 0);
  craneArm.rotation.z = 0.5;
  car.add(craneArm);
  // Hook
  const hook = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.05, 6, 12, Math.PI * 1.5),
    metal
  );
  hook.position.set(-3.35, 1.6, 0);
  hook.rotation.x = Math.PI / 2;
  car.add(hook);
  // Cable
  const cable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4),
    darkMetal
  );
  cable.position.set(-3.4, 1.85, 0);
  car.add(cable);

  // Asymmetric side mirrors
  for (let side = -1; side <= 1; side += 2) {
    const mirror = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.25, 0.3),
      metal
    );
    mirror.position.set(1.35, 1.5, side * 1.25);
    mirror.rotation.z = side * 0.1;
    car.add(mirror);
  }

  addWheels(car);

  return car;
}

function addWheels(car) {
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const rimMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const positions = [
    [1.0, 0.55, 1.1], [1.0, 0.55, -1.1],
    [-1.5, 0.55, 1.1], [-1.5, 0.55, -1.1],
  ];
  const wheels = [];
  for (const [x, y, z] of positions) {
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.45, 14),
      wheelMat
    );
    tire.rotation.x = Math.PI / 2;
    tire.position.set(x, y, z);
    car.add(tire);
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.47, 8),
      rimMat
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, y, z);
    car.add(rim);
    wheels.push(tire);
  }
  car.userData.wheels = wheels;
}
