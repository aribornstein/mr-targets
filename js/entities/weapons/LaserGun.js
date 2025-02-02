// js/entities/weapons/LaserGun.js
import BaseWeapon from './BaseWeapon.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class LaserGun extends BaseWeapon {
  constructor(owner) {
    super(owner);
    this.fireRate = 2; // Faster fire rate.
  }

  fire(time, scene) {
    if (!this.canFire(time)) return;
    this.lastFired = time;
    // Create a simple laser beam (a thin red cylinder).
    const geometry = new THREE.CylinderGeometry(0.005, 0.005, 1, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const beam = new THREE.Mesh(geometry, material);
    // Position the beam at the owner's position.
    beam.position.copy(this.owner.position);
    // Orient the beam in the forward direction.
    this.owner.getWorldDirection(beam.rotation);
    scene.add(beam);
    // Remove the beam after a short delay.
    setTimeout(() => scene.remove(beam), 100);
  }
}
