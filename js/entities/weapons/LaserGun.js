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
   */
  fire(currentTime, origin, scene) {
    if (!this.canFire(currentTime)) return;
    this.lastFired = currentTime;

    // Create a bullet geometry (small cylinder)
    const bulletGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.2, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    // Rotate bullet to be forward facing.
    bullet.rotation.x = Math.PI / 2;

    // Position bullet at the controller position and offset slightly forward.
    bullet.position.copy(origin.position);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(origin.quaternion).normalize();
    bullet.position.add(forward.clone().multiplyScalar(0.1));

    // Set velocity for the bullet.
    bullet.userData.velocity = forward.multiplyScalar(0.5); // adjust speed as needed

    // Add bullet to the scene.
    scene.add(bullet);

    // Add bullet to a global bullet array for collision detection.
    // (Ensure that gameManager uses this bullet array.)
    if (scene.userData.bulletArray) {
      scene.userData.bulletArray.push(bullet);
    } else {
      scene.userData.bulletArray = [bullet];
    }
  }
}