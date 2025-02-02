import BaseWeapon from './BaseWeapon.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class PelletGun extends BaseWeapon {
  constructor(options = {}) {
    super({ fireRate: options.fireRate || 5 });
  }

  /**
   * Fire the pellet gun. Spawns multiple small pellets in a spread.
   * @param {Number} currentTime
   * @param {THREE.Object3D} origin
   * @param {THREE.Scene} scene
   * @param {Array} bulletArray
   */
  fire(currentTime, origin, scene, bulletArray) {
    if (!this.canFire(currentTime)) return;
    this.lastFired = currentTime;

    // Number of pellets
    const pelletCount = 5;

    for (let i = 0; i < pelletCount; i++) {
      const pelletGeometry = new THREE.SphereGeometry(0.01, 8, 8);
      const pelletMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);

      // Position pellet at origin
      pellet.position.copy(origin.position);

      // Spread pellets slightly
      const spreadAngle = (Math.random() - 0.5) * 0.1; 
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(origin.quaternion).normalize();
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle);

      pellet.position.add(forward.clone().multiplyScalar(0.05));

      // Apply velocity
      pellet.userData.velocity = forward.multiplyScalar(0.3);

      scene.add(pellet);
      bulletArray.push(pellet);
    }
  }
}