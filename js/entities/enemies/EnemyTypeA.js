// js/entities/enemies/EnemyTypeA.js
import BaseEnemy from './BaseEnemy.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class EnemyTypeA extends BaseEnemy {
  constructor(position) {
    super(position);
    // Customize appearance (green color) and add extra behavior.
    this.material.color.setHex(0x00ff00);
    this.speed = 0.2;
  }

  update(delta) {
    if (!this.isExploding) {
      // Example: move side-to-side.
      this.mesh.position.x += this.speed * delta;
    }
    return super.update(delta);
  }
}
