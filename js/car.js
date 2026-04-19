import * as THREE from 'three';
import { buildMcQueen } from './cars/mcqueen.js';
import { buildStorm } from './cars/storm.js';
import { buildMater } from './cars/mater.js';
import { TRACK, nearestTrackPoint, trackTangentAt } from './track.js';

export const CAR_TYPES = {
  mcqueen: {
    name: 'Saetta McQueen',
    build: buildMcQueen,
    maxSpeed: 28,
    accel: 14,
    steerSpeed: 1.8,
  },
  storm: {
    name: 'Jackson Storm',
    build: buildStorm,
    maxSpeed: 34,
    accel: 18,
    steerSpeed: 1.2,
  },
  mater: {
    name: 'Cricchetto',
    build: buildMater,
    maxSpeed: 20,
    accel: 10,
    steerSpeed: 2.4,
  },
};

export class Car {
  constructor(type) {
    const cfg = CAR_TYPES[type];
    this.type = type;
    this.config = cfg;
    this.mesh = cfg.build();
    this.speed = 0;
    this.steer = 0; // -1..1
    this.heading = Math.PI / 2; // facing +Z initially, we will set on spawn
    this.offTrack = false;
    this.wobble = 0;
  }

  spawnAtStart() {
    // Start on track at angle 0 (x = rx), facing forward along tangent
    const startX = TRACK.rx;
    const startZ = 0;
    this.mesh.position.set(startX, 0, startZ);
    const tan = trackTangentAt(0);
    this.heading = Math.atan2(tan.z, tan.x);
    this.mesh.rotation.y = this.heading;
  }

  update(dt, input, racing) {
    const cfg = this.config;

    // Auto-acceleration during race
    if (racing) {
      this.speed = Math.min(this.speed + cfg.accel * dt, cfg.maxSpeed);
    } else {
      this.speed = Math.max(0, this.speed - cfg.accel * dt);
    }

    // Off-track penalty
    if (this.offTrack) {
      this.speed = Math.min(this.speed, cfg.maxSpeed * 0.5);
    }

    // Steering (input.steer is -1..1)
    const steerInput = input.steer;
    // More responsive steering at speed
    const steerRate = cfg.steerSpeed * (0.6 + this.speed / cfg.maxSpeed * 0.6);
    this.heading -= steerInput * steerRate * dt;

    // Move forward in heading direction
    const vx = Math.sin(this.heading) * this.speed * dt;
    const vz = Math.cos(this.heading) * this.speed * dt;
    this.mesh.position.x += vx;
    this.mesh.position.z += vz;

    // Check track boundary
    const px = this.mesh.position.x;
    const pz = this.mesh.position.z;
    const near = nearestTrackPoint(px, pz);
    const halfW = TRACK.width / 2;
    const overshoot = near.distance - halfW;

    if (overshoot > 0) {
      this.offTrack = true;
      // Gentle push back toward track center
      const dirX = (near.cx - px);
      const dirZ = (near.cz - pz);
      const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
      const push = Math.min(overshoot * 2.5, 4) * dt;
      this.mesh.position.x += (dirX / len) * push;
      this.mesh.position.z += (dirZ / len) * push;
      // Also steer heading gently toward tangent
      const tan = trackTangentAt(near.angle);
      const tangentHeading = Math.atan2(tan.z, tan.x);
      const diff = shortestAngle(tangentHeading - this.heading);
      this.heading += diff * Math.min(dt * 1.5, 0.5);
      this.wobble += dt * 10;
    } else {
      this.offTrack = false;
      this.wobble *= 0.9;
    }

    // Apply bounce for off-track wobble
    const bounceY = this.offTrack ? Math.abs(Math.sin(this.wobble)) * 0.1 : 0;

    this.mesh.rotation.y = this.heading;
    this.mesh.rotation.z = -steerInput * 0.06; // slight roll
    this.mesh.position.y = bounceY;

    // Spin wheels
    const wheels = this.mesh.userData.wheels;
    if (wheels) {
      const spin = this.speed * dt * 2.5;
      for (const w of wheels) {
        w.rotation.y += spin;
      }
    }
  }

  getLapAngle() {
    const p = this.mesh.position;
    return Math.atan2(p.z / TRACK.rz, p.x / TRACK.rx);
  }

  normalizedSpeed() {
    return this.speed / this.config.maxSpeed;
  }
}

function shortestAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
