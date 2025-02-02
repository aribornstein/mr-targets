// js/core/gameManager.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { createScene, createCamera, createRenderer } from './scene.js';
import { setupControllers } from './controllers.js';
import { createUIPanel, updateUIPanel } from './ui.js';
import EnemyTypeA from '../entities/enemies/EnemyTypeA.js';
import EnemyTypeB from '../entities/enemies/EnemyTypeB.js';
import LaserGun from '../entities/weapons/LaserGun.js';

let bulletArray = []; // Array to track any spawned bullets (if needed)
let enemyArray = [];  // Array to track enemy objects

const clock = new THREE.Clock();

export default class GameManager {
  constructor() {
    // Create scene, camera, and renderer.
    this.scene = createScene();
    this.camera = createCamera();
    this.renderer = createRenderer();

    // Set up controllers. The onSelect callback is bound to this instance.
    setupControllers(this.renderer, this.scene, this.onSelect.bind(this));

    // Set up the in-world UI panel.
    createUIPanel(this.renderer, this.camera, this.scene);

    // Create initial enemy entities.
    this.createEnemies();

    // Initialize game state.
    this.timeLeft = 60;
    this.score = 0;
    this.gameOver = false;

    // Instantiate a weapon (here a LaserGun). In this example, the weapon is fired from the controller.
    // You could expand this by associating a weapon with each controller.
    this.currentWeapon = new LaserGun({ fireRate: 2 });

    // Handle window resize.
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Start the render loop.
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  createEnemies() {
    // Remove any existing enemy meshes from the scene.
    enemyArray.forEach(enemy => this.scene.remove(enemy.mesh));
    enemyArray = [];
    // Spawn 5 enemies.
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    // Determine a spawn position.
    // We try to use room boundaries (if available) to spawn the enemy.
    let spawnPos = new THREE.Vector3();
    const refSpace = this.renderer.xr.getReferenceSpace();
    if (refSpace && refSpace.boundsGeometry && refSpace.boundsGeometry.length > 0) {
      // Convert the XR bounds to 2D points (using X and Z).
      const polygon = refSpace.boundsGeometry.map(pt => new THREE.Vector2(pt.x, pt.z));
      if (!polygon[0].equals(polygon[polygon.length - 1])) {
        polygon.push(polygon[0].clone());
      }
      // Compute the bounding box of the polygon.
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      polygon.forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minZ) minZ = pt.y;
        if (pt.y > maxZ) maxZ = pt.y;
      });
      let candidate;
      let attempts = 0;
      while (attempts < 10) {
        const x = minX + Math.random() * (maxX - minX);
        const z = minZ + Math.random() * (maxZ - minZ);
        candidate = new THREE.Vector2(x, z);
        if (isPointInPolygon(candidate, polygon)) break;
        attempts++;
      }
      spawnPos.set(candidate.x, 1 + Math.random() * 0.5, candidate.y);
    } else {
      // Fallback spawn position.
      spawnPos.set(
        Math.random() * 2 - 1,
        1 + Math.random() * 0.5,
        -2 - Math.random() * 2
      );
    }

    // Create an enemy using EnemyTypeA.
    const enemy = new EnemyTypeB(spawnPos);
    enemyArray.push(enemy);
    this.scene.add(enemy.mesh);
  }

  onSelect(event) {
    // If game over, reset the game.
    if (this.gameOver) {
      this.resetGame();
      return;
    }

    const controller = event.target;

    // Instead of directly spawning a bullet, use the current weapon's fire method.
    // Get the current time in seconds.
    const currentTime = performance.now() / 1000;
    this.currentWeapon.fire(currentTime, controller, this.scene, bulletArray);

    // (If you wish to have both visual bullet objects and weapon fire effects,
    // you can combine the two approaches.)
  }

  resetGame() {
    // Reset game state.
    this.timeLeft = 60;
    this.score = 0;
    this.gameOver = false;

    // Remove all bullets.
    bulletArray.forEach(bullet => this.scene.remove(bullet));
    bulletArray = [];

    // Remove all enemy meshes.
    enemyArray.forEach(enemy => this.scene.remove(enemy.mesh));
    enemyArray = [];
    this.createEnemies();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    const delta = clock.getDelta();

    // Update the game timer if the game is not over.
    if (!this.gameOver) {
      this.timeLeft -= delta;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.gameOver = true;
      }
    }

    // Update bullets.
    for (let i = bulletArray.length - 1; i >= 0; i--) {
      const bullet = bulletArray[i];
      bullet.position.add(bullet.userData.velocity);
      if (bullet.position.distanceTo(this.camera.position) > 20) {
        this.scene.remove(bullet);
        bulletArray.splice(i, 1);
      }
    }

    // Check for collisions between any bullets and enemies.
    for (let i = bulletArray.length - 1; i >= 0; i--) {
      const bullet = bulletArray[i];
      for (let j = enemyArray.length - 1; j >= 0; j--) {
        const enemy = enemyArray[j];
        if (!enemy.isExploding) {
          if (bullet.position.distanceTo(enemy.mesh.position) < 0.28) {
            enemy.explode();
            this.score++;
            this.scene.remove(bullet);
            bulletArray.splice(i, 1);
            break;
          }
        }
      }
    }

    // Update enemies.
    for (let i = enemyArray.length - 1; i >= 0; i--) {
      const enemy = enemyArray[i];
      if (enemy.update(delta)) {
        // Once an enemy has finished its explosion, remove it and spawn a new one.
        this.scene.remove(enemy.mesh);
        enemyArray.splice(i, 1);
        this.spawnEnemy();
      }
    }

    // Update the UI panel.
    updateUIPanel(this.score, this.timeLeft, this.gameOver);

    // Render the scene.
    this.renderer.render(this.scene, this.camera);
  }
}

// Helper function: Determines whether a 2D point is inside a polygon using ray-casting.
function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      ((yi > point.y) !== (yj > point.y)) &&
      (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
