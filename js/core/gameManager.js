// js/core/gameManager.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { createScene, createRenderer } from './scene.js';
import { setupControllers } from './controllers.js';
import { createUIPanel, updateUIPanel } from './ui.js';
import EnemyTypeA from '../entities/enemies/EnemyTypeA.js';

export default class GameManager {
  constructor() {
    // Set up scene and renderer.
    this.scene = createScene();
    this.renderer = createRenderer();
    document.body.appendChild(this.renderer.domElement);

    // Set up AR button.
    // (For example, you might use ARButton.createButton here.)
    // Note: Ensure ARButton is imported in main.js or here if needed.

    // Set up camera.
    this.camera = new THREE.PerspectiveCamera(
      70, window.innerWidth / window.innerHeight, 0.01, 1000
    );
    this.camera.position.set(0, 1.6, 0);

    // Set up controllers and UI.
    setupControllers(this.scene, this.camera, this.renderer);
    createUIPanel(this.scene, this.camera, this.renderer);

    // Listen for controller select events.
    this.scene.addEventListener('controllerSelect', (event) => {
      // If game over, restart.
      if (this.gameOver) {
        this.resetGame();
      } else {
        // Otherwise, fire a bullet.
        this.fireBullet(event.controller);
      }
    });

    // Initialize enemy list.
    this.enemies = [];
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }

    // Game state.
    this.timeLeft = 60;
    this.score = 0;
    this.gameOver = false;

    window.addEventListener("resize", () => this.onWindowResize());
  }

  fireBullet(controller) {
    // Create a bullet and add it to the scene.
    const bulletGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(controller.position);
    // Determine forward direction.
    const speed = 0.1;
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(controller.quaternion);
    bullet.userData.velocity = direction.multiplyScalar(speed);
    this.scene.add(bullet);
    if (!this.bullets) this.bullets = [];
    this.bullets.push(bullet);
  }

  spawnEnemy() {
    // For simplicity, spawn EnemyTypeA at a random position.
    const pos = new THREE.Vector3(
      Math.random() * 2 - 1,
      1 + Math.random() * 0.5,
      -2 - Math.random() * 2
    );
    const enemy = new EnemyTypeA(pos);
    this.enemies.push(enemy);
    this.scene.add(enemy.mesh);
  }

  update(delta, currentTime) {
    if (!this.gameOver) {
      this.timeLeft -= delta;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.gameOver = true;
      }
    }

    // Update bullets.
    if (this.bullets) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        bullet.position.add(bullet.userData.velocity);
        if (bullet.position.distanceTo(this.camera.position) > 20) {
          this.scene.remove(bullet);
          this.bullets.splice(i, 1);
        } else {
          // Check collision with enemies.
          for (let j = this.enemies.length - 1; j >= 0; j--) {
            const enemy = this.enemies[j];
            if (!enemy.isExploding && bullet.position.distanceTo(enemy.mesh.position) < 0.28) {
              enemy.explode();
              this.score++;
              this.scene.remove(bullet);
              this.bullets.splice(i, 1);
              break;
            }
          }
        }
      }
    }

    // Update enemies.
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.update(delta)) {
        // Enemy finished exploding: remove it and spawn a new one.
        this.scene.remove(enemy.mesh);
        this.enemies.splice(i, 1);
        this.spawnEnemy();
      }
    }

    updateUIPanel(this.score, this.timeLeft, this.gameOver);
    this.renderer.render(this.scene, this.camera);
  }

  resetGame() {
    this.timeLeft = 60;
    this.score = 0;
    this.gameOver = false;
    // Remove bullets.
    if (this.bullets) {
      this.bullets.forEach(bullet => this.scene.remove(bullet));
      this.bullets = [];
    }
    // Remove enemies.
    this.enemies.forEach(enemy => this.scene.remove(enemy.mesh));
    this.enemies = [];
    // Spawn fresh enemies.
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
