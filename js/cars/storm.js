import * as THREE from 'three';

function makeSideTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  // Black gradient
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#1a1a2a');
  g.addColorStop(1, '#05050f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  // Electric blue lightning bolt ("S")
  ctx.fillStyle = '#1b7fff';
  ctx.beginPath();
  ctx.moveTo(80, 60);
  ctx.lineTo(260, 40);
  ctx.lineTo(200, 120);
  ctx.lineTo(300, 110);
  ctx.lineTo(130, 220);
  ctx.lineTo(180, 150);
  ctx.lineTo(100, 160);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4fc3ff';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Number "2.0"
  ctx.fillStyle = '#aaa';
  ctx.font = 'bold 100px Arial Black, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2.0', 390, 130);
  // Sponsor text
  ctx.fillStyle = '#888';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('PISTON CUP', 400, 200);
  ctx.fillText('IGNTR', 400, 225);
  ctx.fillStyle = '#1b7fff';
  ctx.fillText('CARBON', 120, 235);
  return new THREE.CanvasTexture(c);
}

function makeRoofTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#1b7fff';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 196, 196);
  ctx.fillStyle = '#aaa';
  ctx.font = 'bold 130px Arial Black, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2.0', 128, 128);
  return new THREE.CanvasTexture(c);
}

export function buildStorm() {
  const car = new THREE.Group();

  const blackMat = new THREE.MeshPhongMaterial({
    color: 0x0a0a14, shininess: 80, specular: 0x222233
  });
  const sideTex = makeSideTexture();
  const sideMat = new THREE.MeshPhongMaterial({ map: sideTex, shininess: 60 });
  const roofTex = makeRoofTexture();
  const roofMat = new THREE.MeshPhongMaterial({ map: roofTex, shininess: 60 });
  const blueAccent = new THREE.MeshBasicMaterial({ color: 0x1b7fff });

  // Main body - long and sleek
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.7, 2.0),
    [sideMat, sideMat, blackMat, blackMat, blackMat, blackMat]
  );
  body.position.y = 0.55;
  car.add(body);

  // Front pointed nose (sharp)
  const noseShape = new THREE.Shape();
  noseShape.moveTo(0, 0);
  noseShape.lineTo(1.5, 0.5);
  noseShape.lineTo(1.5, -0.5);
  noseShape.closePath();
  const noseGeo = new THREE.ExtrudeGeometry(noseShape, { depth: 0.6, bevelEnabled: false });
  const nose = new THREE.Mesh(noseGeo, blackMat);
  nose.rotation.x = -Math.PI / 2;
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(2.6, 0.6, -0.3);
  car.add(nose);

  // Side skirts (angular)
  for (let side = -1; side <= 1; side += 2) {
    const skirt = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.3, 0.15),
      blackMat
    );
    skirt.position.set(0, 0.3, side * 1.08);
    car.add(skirt);
  }

  // Blue accent strips on sides (below lightning)
  for (let side = -1; side <= 1; side += 2) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.04, 0.02),
      blueAccent
    );
    strip.position.set(0, 0.25, side * 1.025);
    car.add(strip);
  }

  // Cabin - low and aggressive
  const cabinMats = [blackMat, blackMat, roofMat, blackMat, blackMat, blackMat];
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.55, 1.6),
    cabinMats
  );
  cabin.position.set(-0.2, 1.15, 0);
  car.add(cabin);

  // Slanted windshield (narrow, cold expression)
  const windshieldMat = new THREE.MeshPhongMaterial({
    color: 0x1a2a4a, transparent: true, opacity: 0.6, shininess: 120
  });
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.4, 1.5),
    windshieldMat
  );
  windshield.position.set(0.7, 1.2, 0);
  windshield.rotation.z = -0.45;
  car.add(windshield);

  // Felix-cat gray eyes
  const eyeWhite = new THREE.MeshLambertMaterial({ color: 0xd0d0d0 });
  const eyeGray = new THREE.MeshBasicMaterial({ color: 0x444444 });
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), eyeWhite);
    eye.position.set(1.05, 1.3, i * 0.4);
    eye.scale.set(0.45, 0.55, 1);
    car.add(eye);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeGray);
    pupil.position.set(1.2, 1.28, i * 0.4);
    pupil.scale.set(0.5, 1.2, 1);
    car.add(pupil);
  }

  // Rear window
  const rearWin = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.35, 1.5),
    windshieldMat
  );
  rearWin.position.set(-1.1, 1.3, 0);
  rearWin.rotation.z = 0.5;
  car.add(rearWin);

  // Multi-element rear spoiler (pronounced, geometric)
  const spoilerPostMat = blackMat;
  for (let side = -1; side <= 1; side += 2) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.45, 0.08),
      spoilerPostMat
    );
    post.position.set(-2.2, 1.05, side * 0.9);
    car.add(post);
  }
  const topWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.08, 2.1),
    blackMat
  );
  topWing.position.set(-2.2, 1.35, 0);
  car.add(topWing);
  // Blue accent on wing
  const wingAccent = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.02, 2.12),
    blueAccent
  );
  wingAccent.position.set(-2.2, 1.4, 0);
  car.add(wingAccent);
  // Lower wing element
  const lowerWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.05, 1.9),
    blackMat
  );
  lowerWing.position.set(-2.4, 1.1, 0);
  car.add(lowerWing);

  // Front air intakes (sharp)
  const intakeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (let side = -1; side <= 1; side += 2) {
    const intake = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 0.6),
      intakeMat
    );
    intake.position.set(2.55, 0.45, side * 0.6);
    car.add(intake);
  }

  // Headlights - thin LED strips (blue glow)
  for (let side = -1; side <= 1; side += 2) {
    const hl = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.5),
      blueAccent
    );
    hl.position.set(2.55, 0.75, side * 0.7);
    car.add(hl);
  }

  addWheels(car, { radius: 0.48, width: 0.4 });

  return car;
}

function addWheels(car, opts) {
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x0a0a0a, shininess: 30 });
  const rimMat = new THREE.MeshPhongMaterial({ color: 0x333344, shininess: 100 });
  const positions = [
    [1.8, 0.48, 1.0], [1.8, 0.48, -1.0],
    [-1.7, 0.48, 1.0], [-1.7, 0.48, -1.0],
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
      new THREE.CylinderGeometry(opts.radius * 0.6, opts.radius * 0.6, opts.width + 0.02, 6),
      rimMat
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, y, z);
    car.add(rim);
    wheels.push(tire);
  }
  car.userData.wheels = wheels;
}
