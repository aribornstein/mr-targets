// js/entities/weapons/LaserGun.js
import BaseWeapon from './BaseWeapon.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

export default class LaserGun extends BaseWeapon {
  constructor(options = {}) {
    // You can set a custom fire rate if desired.
    super({ fireRate: options.fireRate || 2 });
    // Additional LaserGun-specific properties can be set here.
  }

  /**
   * Fire the laser gun.
   * @param {Number} currentTime The current time (seconds).
   * @param {THREE.Object3D} origin The object (e.g., controller) from which to fire.
   * @param {THREE.Scene} scene The scene to add projectiles to.
   */
  fire(currentTime, origin, scene) {
    if (!this.canFire(currentTime)) return;
    this.lastFired = currentTime;
    
    // Create a "laser beam" as a thin cylinder.
    const beamLength = 1; // meters
    const beamGeometry = new THREE.CylinderGeometry(0.005, 0.005, beamLength, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    
    // Position the beam at the origin. Adjust so that it extends forward.
    // The default cylinder in Three.js is centered on the origin along the Y-axis.
    // We rotate it to point along the -Z axis.
    beam.rotation.x = Math.PI / 2;
    // Set the beam’s position relative to the origin.
    beam.position.copy(origin.position);
    // Offset it so that its front end is at the origin.
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(origin.quaternion);
    beam.position.add(forward.clone().multiplyScalar(beamLength / 2));
    
    scene.add(beam);
    
    // Remove the beam after a short delay.
    setTimeout(() => {
      scene.remove(beam);
    }, 100); // Remove after 100ms (adjust as needed)
  }
}
