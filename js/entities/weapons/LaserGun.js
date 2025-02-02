// js/entities/weapons/LaserGun.js
import BaseWeapon from './BaseWeapon.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class LaserGun extends BaseWeapon {
  constructor(options = {}) {
    super({ fireRate: options.fireRate || 2 });
  }

  /**
   * Fire the laser gun as a projectile.
   * @param {Number} currentTime The current time (seconds).
   * @param {THREE.Object3D} origin The object (e.g., controller) from which to fire.
   * @param {THREE.Scene} scene The scene to add projectiles to.
   * @param {Array} bulletArray The shared bullet array.
   */
  fire(currentTime, origin, scene, bulletArray) {
    if (!this.canFire(currentTime)) return;
    this.lastFired = currentTime;

    // Create a bullet geometry (thin, long box)
    const bulletGeometry = new THREE.BoxGeometry(0.01, 0.01, 0.2);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    // Position bullet at the controller position and offset slightly forward.
    bullet.position.copy(origin.position);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(origin.quaternion).normalize();
    bullet.position.add(forward.clone().multiplyScalar(0.1));

    // Set velocity for the bullet.
    bullet.userData.velocity = forward.multiplyScalar(0.5); // adjust speed as needed

    // Add bullet to the scene.
    scene.add(bullet);

    // Add bullet to the shared bullet array
    bulletArray.push(bullet);
  }

  /**
   * Update the bullets' positions based on their velocities.
   * @param {THREE.Scene} scene The scene containing the bullets.
   * @param {Number} deltaTime The time elapsed since the last frame (seconds).
   */
  update(scene, deltaTime) {
    // This can be removed if bullet updates are handled in gameManager
    if (!scene.userData.bulletArray) return;

    scene.userData.bulletArray.forEach(bullet => {
      bullet.position.add(bullet.userData.velocity.clone().multiplyScalar(deltaTime));
    });
  }
}