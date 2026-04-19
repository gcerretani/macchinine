import * as THREE from 'three';
import { Game } from './game.js';
import { CAR_TYPES } from './car.js';

const selectionScreen = document.getElementById('selection-screen');
const gameScreen = document.getElementById('game-screen');
const homeBtn = document.getElementById('home-btn');
const canvas = document.getElementById('game-canvas');

let game = null;
const previewAnimators = [];

function showScreen(which) {
  selectionScreen.classList.toggle('active', which === 'selection');
  gameScreen.classList.toggle('active', which === 'game');
}

function setupPreviews() {
  const previews = document.querySelectorAll('.car-preview');
  previews.forEach((el) => {
    const carType = el.dataset.preview;
    const width = el.clientWidth || 300;
    const height = el.clientHeight || 180;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 3.5, 6);
    camera.lookAt(0, 1, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 10, 6);
    scene.add(dir);
    scene.add(new THREE.HemisphereLight(0xbfe9ff, 0x806040, 0.3));

    // Ground platform
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 32),
      new THREE.MeshLambertMaterial({ color: 0xc9a25a })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const car = CAR_TYPES[carType].build();
    scene.add(car);

    const ctx = {
      renderer, scene, camera, car, el,
      onResize: () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      },
    };
    previewAnimators.push(ctx);
    window.addEventListener('resize', ctx.onResize);
  });

  let last = performance.now();
  const animate = () => {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    for (const p of previewAnimators) {
      p.car.rotation.y += dt * 0.7;
      p.renderer.render(p.scene, p.camera);
    }
    requestAnimationFrame(animate);
  };
  animate();
}

function selectCar(type) {
  showScreen('game');
  if (!game) {
    game = new Game(canvas);
  }
  game.setCarType(type);
  game.start();
}

function returnHome() {
  if (game) {
    game.stop();
    game = null;
  }
  showScreen('selection');
}

document.querySelectorAll('.car-card').forEach((card) => {
  const handler = () => selectCar(card.dataset.car);
  card.addEventListener('click', handler);
});

homeBtn.addEventListener('click', returnHome);

// Prevent default touch behaviors that would interfere (scroll, zoom)
document.addEventListener('touchmove', (e) => {
  if (gameScreen.classList.contains('active')) e.preventDefault();
}, { passive: false });

// Initialize previews after layout
window.addEventListener('load', () => {
  setupPreviews();
});
