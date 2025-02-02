// js/entities/enemies/EnemyTypeA.js
import BaseEnemy from './BaseEnemy.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class EnemyTypeA extends BaseEnemy {
  constructor(position) {
    super(position);
    // Customize appearance for EnemyTypeA.
    this.material.color.setHex(0x00ff00);
    // Add any extra properties such as movement speed.
    this.speed = 0.2;
  }

  update(delta) {
    // Example custom behavior: move slowly side-to-side.
    if (!this.isExploding) {
      this.mesh.position.x += this.speed * delta;
    }
    return super.update(delta);
  }
}
