// filepath: /Users/abornst/Documents/mr-targets/js/entities/enemies/EnemyTypeC.js
import BaseEnemy from './BaseEnemy.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class EnemyTypeC extends BaseEnemy {
  constructor(position) {
    super(position);
    // Customize appearance (blue color)
    this.material.color.setHex(0x0000ff);
    this.score = 15;
    this.speed = 0.1; // Vertical speed
    this.topBoundary = 50;
    this.bottomBoundary = -50;
    this.direction = 1; // 1 for down, -1 for up
  }

  update(delta) {
    if (this.isExploding) {
      return super.update(delta); // Call the base class update for explosion handling
    }
    
    // Update vertical movement
    this.mesh.position.y += this.speed * this.direction * delta;
    if (this.mesh.position.y > this.topBoundary || this.mesh.position.y < this.bottomBoundary) {
      this.direction *= -1; // Reverse direction
    }
    return false;
  }
}