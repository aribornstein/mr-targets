// js/entities/weapons/BaseWeapon.js
export default class BaseWeapon {
    constructor(owner) {
      this.owner = owner; // Typically the player or controller.
      this.fireRate = 1;  // Shots per second.
      this.lastFired = 0;
    }
  
    canFire(time) {
      return time - this.lastFired >= 1 / this.fireRate;
    }
  
    fire(time, scene) {
      if (!this.canFire(time)) return;
      this.lastFired = time;
      // Base implementation: override in subclass.
      console.log('Firing base weapon');
    }
  }
  