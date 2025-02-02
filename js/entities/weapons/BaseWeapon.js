// js/entities/weapons/BaseWeapon.js
export default class BaseWeapon {
    /**
     * @param {Object} options Options for the weapon.
     *   options.fireRate: shots per second (default: 1)
     */
    constructor(options = {}) {
      this.fireRate = options.fireRate || 1; // shots per second
      this.lastFired = 0;
    }
  
    /**
     * Returns true if the weapon is allowed to fire at the given time.
     * @param {Number} currentTime The current time (seconds).
     */
    canFire(currentTime) {
      return currentTime - this.lastFired >= 1 / this.fireRate;
    }
  
    /**
     * Fires the weapon.
     * Override this method in subclasses to implement specific firing behavior.
     * @param {Number} currentTime The current time (seconds).
     * @param {THREE.Object3D} origin The object (e.g., controller) from which to fire.
     * @param {THREE.Scene} scene The scene to add projectiles to.
     */
    fire(currentTime, origin, scene) {
      if (!this.canFire(currentTime)) return;
      this.lastFired = currentTime;
      // Base implementation does nothing.
      console.log("Firing base weapon (this should be overridden)");
    }
  }
  