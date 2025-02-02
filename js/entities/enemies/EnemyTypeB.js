import BaseEnemy from './BaseEnemy.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class EnemyTypeB extends BaseEnemy {
  constructor(position) {
    super(position);
    // Customize appearance (red color)
    this.score = 5;
    this.material.color.setHex(0xff0000);
    // No movement speed needed for stationary enemy
  }

  update(delta) {
    if (!this.isExploding) {
      // Stationary enemy: no movement logic
      return;
    }
    return super.update(delta);
  }
}