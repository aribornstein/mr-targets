// js/entities/enemies/EnemyTypeA.js
import BaseEnemy from './BaseEnemy.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class EnemyTypeA extends BaseEnemy {
  constructor(position) {
    super(position);
    // Customize appearance (green color) and add extra behavior.
    this.material.color.setHex(0x00ff00);
    this.score = 10;
    this.speed = 0.2;
    this.leftBoundary = -100;
    this.rightBoundary = 100;
    // Add explosion state flags.
    this.isExploding = false;
    this.exploded = false;
  }

  // New explode method
  explode() {
    if (this.isExploding) return;
    this.isExploding = true;
    // Optionally trigger explosion visuals here.
    setTimeout(() => {
      this.exploded = true;
    }, 500); // explosion duration in ms
  }

  update(delta) {
    if (this.isExploding) {
      // Once explosion animation is finished, signal removal.
      if (this.exploded) return true;
      return false;
    } else {
      // Example: move side-to-side.
      this.mesh.position.x += this.speed * delta;
      if (this.mesh.position.x > this.rightBoundary || this.mesh.position.x < this.leftBoundary) {
        this.speed = -this.speed;
      }
    }
    return super.update(delta);
  }
}
