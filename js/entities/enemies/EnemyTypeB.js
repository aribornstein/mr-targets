import BaseEnemy from './BaseEnemy.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class EnemyTypeB extends BaseEnemy {
  constructor(position) {
    super(position);
    // Customize appearance (red color)
    this.score = 5;
    this.material.color.setHex(0xff0000);
    // No movement speed needed for stationary enemy
    // Initialize explosion state flags
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
    }
    // Stationary enemy: no movement logic when not exploding.
    return false;
  }
}