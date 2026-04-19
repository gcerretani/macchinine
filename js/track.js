import * as THREE from 'three';

export const TRACK = {
  rx: 55,
  rz: 35,
  width: 11,
  islandPadding: 14,
};

export function nearestTrackPoint(x, z) {
  const angle = Math.atan2(z / TRACK.rz, x / TRACK.rx);
  const cx = Math.cos(angle) * TRACK.rx;
  const cz = Math.sin(angle) * TRACK.rz;
  const dx = x - cx;
  const dz = z - cz;
  const distance = Math.sqrt(dx * dx + dz * dz);
  return { angle, cx, cz, distance };
}

export function trackCenterAt(angle) {
  return {
    x: Math.cos(angle) * TRACK.rx,
    z: Math.sin(angle) * TRACK.rz,
  };
}

export function trackTangentAt(angle) {
  const tx = -Math.sin(angle) * TRACK.rx;
  const tz = Math.cos(angle) * TRACK.rz;
  const len = Math.sqrt(tx * tx + tz * tz);
  return { x: tx / len, z: tz / len };
}

function makeEllipseShape(rx, rz, segments = 96) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * rz;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

function addEllipseHole(shape, rx, rz, segments = 96) {
  const hole = new THREE.Path();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * rz;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  shape.holes.push(hole);
}

export function buildWorld() {
  const group = new THREE.Group();

  // Sky gradient via large hemisphere
  const skyGeo = new THREE.SphereGeometry(500, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x4fb1e4) },
      bottomColor: { value: new THREE.Color(0xfff4d6) },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vPos;
      void main() {
        float h = normalize(vPos).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, clamp(h * 1.2 + 0.3, 0.0, 1.0)), 1.0);
      }`,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  group.add(sky);

  // Sea
  const seaGeo = new THREE.PlaneGeometry(600, 600, 64, 64);
  seaGeo.rotateX(-Math.PI / 2);
  const seaMat = new THREE.MeshLambertMaterial({
    color: 0x2aa7d6,
    transparent: true,
    opacity: 0.92,
  });
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.position.y = -0.05;
  sea.userData.isSea = true;
  group.add(sea);
  // Store original Y positions for animation
  const positions = seaGeo.attributes.position;
  const originalY = new Float32Array(positions.count);
  for (let i = 0; i < positions.count; i++) {
    originalY[i] = positions.getY(i);
  }
  seaGeo.userData = { originalY };

  // Island (sand beach)
  const beachRx = TRACK.rx + TRACK.islandPadding;
  const beachRz = TRACK.rz + TRACK.islandPadding;
  const beachShape = makeEllipseShape(beachRx, beachRz);
  const beachGeo = new THREE.ShapeGeometry(beachShape);
  beachGeo.rotateX(-Math.PI / 2);
  const beachMat = new THREE.MeshLambertMaterial({ color: 0xf4d58d });
  const beach = new THREE.Mesh(beachGeo, beachMat);
  beach.position.y = 0.02;
  group.add(beach);

  // Grass interior (inside track)
  const grassRx = TRACK.rx - TRACK.width / 2 - 0.5;
  const grassRz = TRACK.rz - TRACK.width / 2 - 0.5;
  const grassShape = makeEllipseShape(grassRx, grassRz);
  const grassGeo = new THREE.ShapeGeometry(grassShape);
  grassGeo.rotateX(-Math.PI / 2);
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x7cc96b });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.position.y = 0.04;
  group.add(grass);

  // Dirt track (ring)
  const trackOuter = makeEllipseShape(TRACK.rx + TRACK.width / 2, TRACK.rz + TRACK.width / 2);
  addEllipseHole(trackOuter, TRACK.rx - TRACK.width / 2, TRACK.rz - TRACK.width / 2);
  const trackGeo = new THREE.ShapeGeometry(trackOuter);
  trackGeo.rotateX(-Math.PI / 2);
  const trackMat = new THREE.MeshLambertMaterial({ color: 0xb07a4f });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.position.y = 0.05;
  group.add(track);

  // Track edges (darker rim inside + outside)
  const rimMat = new THREE.MeshLambertMaterial({ color: 0x8a5a38 });
  const innerRim = makeRing(
    TRACK.rx - TRACK.width / 2 - 0.6,
    TRACK.rz - TRACK.width / 2 - 0.6,
    TRACK.rx - TRACK.width / 2,
    TRACK.rz - TRACK.width / 2
  );
  innerRim.position.y = 0.06;
  innerRim.material = rimMat;
  group.add(innerRim);

  // Small rocks scattered on grass
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.5 + Math.random() * 0.6;
    const rx = (TRACK.rx - TRACK.width / 2 - 4) * r;
    const rz = (TRACK.rz - TRACK.width / 2 - 4) * r;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0),
      new THREE.MeshLambertMaterial({ color: 0x888888 })
    );
    rock.position.set(Math.cos(a) * rx, 0.1, Math.sin(a) * rz);
    rock.rotation.y = Math.random() * Math.PI;
    group.add(rock);
  }

  // Palm trees on grass
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const r = 0.55;
    const px = Math.cos(a) * (TRACK.rx - TRACK.width / 2 - 4) * r;
    const pz = Math.sin(a) * (TRACK.rz - TRACK.width / 2 - 4) * r;
    group.add(buildPalm(px, pz));
  }

  return { group, sea, seaGeo };
}

function makeRing(ox, oz, ix, iz) {
  const shape = new THREE.Shape();
  const seg = 96;
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const x = Math.cos(a) * ox;
    const y = Math.sin(a) * oz;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const x = Math.cos(a) * ix;
    const y = Math.sin(a) * iz;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  shape.holes.push(hole);
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x8a5a38 }));
}

function buildPalm(x, z) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 4, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b5a2b })
  );
  trunk.position.y = 2;
  group.add(trunk);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 2.2, 6),
      new THREE.MeshLambertMaterial({ color: 0x2d8a4a })
    );
    const a = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.6, 4, Math.sin(a) * 0.6);
    leaf.rotation.z = Math.cos(a) * 0.6;
    leaf.rotation.x = Math.sin(a) * 0.6;
    group.add(leaf);
  }
  group.position.set(x, 0, z);
  return group;
}

export function animateSea(sea, time) {
  const geo = sea.geometry;
  const positions = geo.attributes.position;
  const originalY = geo.userData.originalY;
  if (!originalY) return;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const wave = Math.sin(x * 0.1 + time * 1.5) * 0.15 + Math.cos(z * 0.12 + time * 1.2) * 0.12;
    positions.setY(i, originalY[i] + wave);
  }
  positions.needsUpdate = true;
  geo.computeVertexNormals();
}
