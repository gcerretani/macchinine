import * as THREE from 'three';
import { buildWorld, animateSea, TRACK } from './track.js';
import { buildDecorations, animateDecorations, setTrafficLightStep } from './decorations.js';
import { Car } from './car.js';
import { Input } from './input.js';
import { EngineAudio } from './audio.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;
    this.renderer.setClearColor(0x87ceeb);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xcfeaf7, 120, 320);

    const w0 = canvas.clientWidth || window.innerWidth;
    const h0 = canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, w0 / h0, 0.1, 600);

    this.setupLights();

    const world = buildWorld();
    this.scene.add(world.group);
    this.sea = world.sea;

    const deco = buildDecorations();
    this.scene.add(deco.group);
    this.decorations = deco;

    this.input = new Input();
    this.audio = new EngineAudio();

    this.car = null;
    this.lap = 1;
    this.lastAngle = 0;
    this.crossedHalf = false;
    this.racing = false;
    this.clock = new THREE.Clock();

    this.lapEl = document.getElementById('lap-num');
    this.countdownEl = document.getElementById('countdown');

    this.running = false;
    this._onResize = this.onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    this._animate = this.animate.bind(this);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.95);
    sun.position.set(50, 100, 40);
    this.scene.add(sun);
    const hemi = new THREE.HemisphereLight(0xaee3ff, 0x554422, 0.35);
    this.scene.add(hemi);
  }

  onResize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setCarType(type) {
    if (this.car) {
      this.scene.remove(this.car.mesh);
    }
    this.car = new Car(type);
    this.car.spawnAtStart();
    this.scene.add(this.car.mesh);
    this.lastAngle = this.car.getLapAngle();
    this.lap = 1;
    this.crossedHalf = false;
    this.updateLapDisplay();

    // Snap camera to initial position behind car
    const back = 9, up = 4.5;
    this.camera.position.set(
      this.car.mesh.position.x - Math.sin(this.car.heading) * back,
      up,
      this.car.mesh.position.z - Math.cos(this.car.heading) * back
    );
  }

  start() {
    this.onResize();
    this.running = true;
    this.clock.start();
    this.audio.start();
    this.startCountdown();
    requestAnimationFrame(this._animate);
  }

  stop() {
    this.running = false;
    this.audio.stop();
    window.removeEventListener('resize', this._onResize);
  }

  startCountdown() {
    this.racing = false;
    const steps = [
      { step: 0, label: '3' },
      { step: 1, label: '2' },
      { step: 2, label: 'VAI!' },
    ];
    let i = 0;
    const show = () => {
      if (i >= steps.length) {
        this.racing = true;
        this.countdownEl.textContent = '';
        setTimeout(() => setTrafficLightStep(this.decorations.trafficLight, -1), 1000);
        return;
      }
      const s = steps[i];
      setTrafficLightStep(this.decorations.trafficLight, s.step);
      this.countdownEl.textContent = s.label;
      this.countdownEl.style.color = i === 2 ? '#2ecc71' : (i === 1 ? '#f1c40f' : '#e74c3c');
      i++;
      setTimeout(show, 1000);
    };
    show();
  }

  updateLapDisplay() {
    if (this.lapEl) this.lapEl.textContent = this.lap;
  }

  updateCamera(dt) {
    if (!this.car) return;
    const car = this.car;
    const back = 9;
    const up = 4.5;
    // Target position behind the car in its heading direction
    const targetX = car.mesh.position.x - Math.sin(car.heading) * back;
    const targetZ = car.mesh.position.z - Math.cos(car.heading) * back;
    const targetY = up;

    // Lerp
    const lerp = Math.min(1, dt * 5);
    this.camera.position.x += (targetX - this.camera.position.x) * lerp;
    this.camera.position.y += (targetY - this.camera.position.y) * lerp;
    this.camera.position.z += (targetZ - this.camera.position.z) * lerp;

    // Look slightly ahead of the car
    const lookX = car.mesh.position.x + Math.sin(car.heading) * 3;
    const lookZ = car.mesh.position.z + Math.cos(car.heading) * 3;
    this.camera.lookAt(lookX, 1.2, lookZ);
  }

  trackLaps() {
    if (!this.car) return;
    const angle = this.car.getLapAngle();
    const prev = this.lastAngle;

    // Mark halfway once the car reaches the far side of the island
    if (Math.abs(angle) > Math.PI * 0.75) {
      this.crossedHalf = true;
    }

    // Crossed start/finish line: prev negative, now positive (CCW motion)
    if (this.crossedHalf && prev < 0 && angle >= 0 && angle < Math.PI * 0.5) {
      this.lap++;
      this.updateLapDisplay();
      this.crossedHalf = false;
    }

    this.lastAngle = angle;
  }

  animate() {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;

    this.input.update(dt);
    if (this.car) {
      this.car.update(dt, this.input, this.racing);
      this.trackLaps();
      this.audio.setSpeed(this.car.normalizedSpeed());
    }

    animateSea(this.sea, time);
    animateDecorations(this.decorations, time);

    this.updateCamera(dt);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._animate);
  }
}
