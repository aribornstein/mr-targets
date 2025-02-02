// filepath: /Users/abornst/Documents/mr-targets/js/entities/enemies/EnemyTypeD.js
import BaseEnemy from './BaseEnemy.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class EnemyTypeD extends BaseEnemy {
  constructor(position) {
    super(position);
    // Customize appearance (yellow color) and set a faster speed.
    this.material.color.setHex(0xffff00);
    this.score = 15;
    this.speed = 0.5; // Faster speed than other enemies
    // Initialize explosion state flags
    this.isExploding = false;
    this.exploded = false;
  }

  // New explode method with unique visuals
  explode() {
    if (this.isExploding) return;
    this.isExploding = true;
    // Trigger explosion visuals here (e.g., change color or add particles)
    this.material.color.setHex(0xffa500); // Change to orange during explosion
    setTimeout(() => {
      this.exploded = true;
      this.material.color.setHex(0xffff00); // Reset color after explosion
    }, 500); // explosion duration in ms
  }

  update(delta) {
    if (this.isExploding) {
      // Once explosion animation is finished, signal removal.
      if (this.exploded) return true;
      return false;
    }
    // Update movement directly on the enemy mesh.
    this.mesh.position.y += this.speed * delta; // Move vertically
    // Reset position if it goes out of bounds (example bounds)
    if (this.mesh.position.y > 100 || this.mesh.position.y < -100) {
      this.speed = -this.speed; // Reverse direction
    }
    return false;
  }
}