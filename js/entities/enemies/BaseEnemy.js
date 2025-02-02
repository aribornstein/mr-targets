// js/entities/enemies/BaseEnemy.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class BaseEnemy {
  constructor(position = new THREE.Vector3()) {
    this.geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 1.0
    });
    this.score = 1;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(position);
    this.isExploding = false;
    this.explodeTime = 0;
    this.explosionDuration = 0.5;
  }

  update(delta) {
    if (this.isExploding) {
      this.explodeTime += delta;
      const progress = this.explodeTime / this.explosionDuration;
      const scaleFactor = 1 + progress * 1.5;
      this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
      this.mesh.material.opacity = 1 - progress;
      if (progress >= 1) {
        return true; // Finished exploding.
      }
    }
    return false;
  }

  explode() {
    this.isExploding = true;
    this.explodeTime = 0;
  }
}
