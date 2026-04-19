import * as THREE from 'three';

function makeDecalTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  // Red body
  ctx.fillStyle = '#d82020';
  ctx.fillRect(0, 0, 512, 256);
  // Orange/yellow side stripe
  ctx.fillStyle = '#f8a722';
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.lineTo(512, 180);
  ctx.lineTo(512, 256);
  ctx.lineTo(0, 256);
  ctx.closePath();
  ctx.fill();
  // Lightning bolt yellow
  ctx.fillStyle = '#ffd93d';
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.lineTo(200, 60);
  ctx.lineTo(160, 120);
  ctx.lineTo(260, 110);
  ctx.lineTo(100, 200);
  ctx.lineTo(150, 140);
  ctx.lineTo(60, 150);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b85500';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Number 95
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 6;
  ctx.font = 'bold 130px Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('95', 360, 130);
  ctx.fillText('95', 360, 130);
  // Rust-eze text
  ctx.fillStyle = '#5a1a0a';
  ctx.font = 'bold 28px Impact, sans-serif';
  ctx.fillText('RUST-EZE', 180, 230);
  return new THREE.CanvasTexture(c);
}

function makeRoofTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d82020';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 8;
  ctx.font = 'bold 160px Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('95', 128, 128);
  ctx.fillText('95', 128, 128);
  return new THREE.CanvasTexture(c);
}

export function buildMcQueen() {
  const car = new THREE.Group();

  const redBody = new THREE.MeshLambertMaterial({ color: 0xd82020 });
  const sideTex = makeDecalTexture();
  const sidedMat = new THREE.MeshLambertMaterial({ map: sideTex });
  const roofTex = makeRoofTexture();
  const roofMat = new THREE.MeshLambertMaterial({ map: roofTex });
  const black = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const chrome = new THREE.MeshLambertMaterial({ color: 0xcccccc });

  // Main lower body (wide, muscular)
  const bodyGeo = new THREE.BoxGeometry(4.4, 0.9, 2.1);
  const bodyMats = [sidedMat, sidedMat, redBody, redBody, redBody, redBody];
  const body = new THREE.Mesh(bodyGeo, bodyMats);
  body.position.y = 0.65;
  car.add(body);

  // Front fender bulge
  const frontFender = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.7, 2.3),
    redBody
  );
  frontFender.position.set(1.3, 0.55, 0);
  car.add(frontFender);

  // Rear fender bulge
  const rearFender = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.7, 2.3),
    redBody
  );
  rearFender.position.set(-1.3, 0.55, 0);
  car.add(rearFender);

  // Hood (rounded front top)
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.5, 1.8),
    redBody
  );
  hood.position.set(1.1, 1.15, 0);
  car.add(hood);

  // Round the hood with a curved top
  const hoodTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 1.6, 12, 1, false, 0, Math.PI),
    redBody
  );
  hoodTop.rotation.z = Math.PI / 2;
  hoodTop.position.set(1.1, 1.4, 0);
  hoodTop.scale.set(0.6, 1, 1.1);
  car.add(hoodTop);

  // Cabin / roof
  const cabinMats = [redBody, redBody, roofMat, redBody, redBody, redBody];
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.9, 1.9),
    cabinMats
  );
  cabin.position.set(-0.2, 1.55, 0);
  car.add(cabin);

  // Windshield (front, large rounded)
  const windshieldMat = new THREE.MeshLambertMaterial({
    color: 0x7fbadf, transparent: true, opacity: 0.8
  });
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.7, 1.7),
    windshieldMat
  );
  windshield.position.set(0.6, 1.6, 0);
  windshield.rotation.z = -0.25;
  car.add(windshield);

  // Eyes (on windshield)
  const eyeWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const eyeGreen = new THREE.MeshBasicMaterial({ color: 0x3fb8d4 });
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), eyeWhite);
    eye.position.set(1.0, 1.75, i * 0.45);
    eye.scale.set(0.7, 1, 1);
    car.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), eyeGreen);
    pupil.position.set(1.18, 1.78, i * 0.45);
    car.add(pupil);
    const highlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    highlight.position.set(1.28, 1.85, i * 0.45);
    car.add(highlight);
  }

  // Rear window
  const rearWin = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 1.7),
    windshieldMat
  );
  rearWin.position.set(-1.0, 1.7, 0);
  rearWin.rotation.z = 0.3;
  car.add(rearWin);

  // Spoiler
  const spoilerPost = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 1.4), redBody);
  spoilerPost.position.set(-2.0, 1.2, 0);
  car.add(spoilerPost);
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 2.0), redBody);
  spoiler.position.set(-2.2, 1.35, 0);
  car.add(spoiler);

  // Side exhausts (2 per side)
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 2; i++) {
      const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8),
        chrome
      );
      exhaust.rotation.z = Math.PI / 2;
      exhaust.position.set(-0.5 - i * 0.5, 0.35, side * 1.1);
      car.add(exhaust);
    }
  }

  // Front grille / air intake
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 1.2), black);
  grille.position.set(2.25, 0.55, 0);
  car.add(grille);

  // Headlights (yellow-ish "expression")
  for (let i = -1; i <= 1; i += 2) {
    const hl = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffedaa })
    );
    hl.position.set(2.25, 0.85, i * 0.55);
    hl.scale.set(0.5, 1, 1);
    car.add(hl);
  }

  // Wheels
  addWheels(car, { radius: 0.5, width: 0.4 });

  return car;
}

function addWheels(car, opts) {
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const rimMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const positions = [
    [1.35, 0.5, 1.0], [1.35, 0.5, -1.0],
    [-1.35, 0.5, 1.0], [-1.35, 0.5, -1.0],
  ];
  const wheels = [];
  for (const [x, y, z] of positions) {
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(opts.radius, opts.radius, opts.width, 16),
      wheelMat
    );
    tire.rotation.x = Math.PI / 2;
    tire.position.set(x, y, z);
    car.add(tire);
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(opts.radius * 0.55, opts.radius * 0.55, opts.width + 0.02, 10),
      rimMat
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, y, z);
    car.add(rim);
    wheels.push(tire);
  }
  car.userData.wheels = wheels;
}
