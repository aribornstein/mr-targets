// js/core/gameManager.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { createScene, createCamera, createRenderer } from './scene.js';
import { setupControllers } from './controllers.js';
import { createUIPanel, updateUIPanel } from './ui.js';
import PelletGun from '../entities/weapons/PelletGun.js';
import EnemySpawnManager from './enemySpawnManager.js';

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

        // Create the enemy spawn manager and spawn initial enemies.
        this.enemySpawnManager = new EnemySpawnManager(this.scene);
        this.createEnemies();

        // Initialize game state.
        this.timeLeft = 60;
        this.score = 0;
        this.gameOver = false;

        // Instantiate a weapon (here a PelletGun).
        this.currentWeapon = new PelletGun({ fireRate: 2 });

        // Handle window resize.
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start the render loop.
        this.renderer.setAnimationLoop(this.render.bind(this));

        this.bulletArray = [];
        this.enemyArray = [];
    }

    createEnemies() {
        // Clear any existing enemies.
        this.enemySpawnManager.clearEnemies();
        this.enemyArray = [];
        // Spawn 5 enemies.
        for (let i = 0; i < 5; i++) {
            const newEnemy = this.enemySpawnManager.spawnEnemy();
            this.enemyArray.push(newEnemy);
        }
    }

    onEnemyDestroyed(enemy) {
        // Update score or other game logic as needed.
        this.score += enemy.score;
        // Let the spawn manager handle removing the enemy and respawning.
        this.enemySpawnManager.onEnemyDestroyed(enemy);
        // Optionally update the UI panel.
        updateUIPanel(this.score, this.timeLeft);
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
        this.currentWeapon.fire(currentTime, controller, this.scene, this.bulletArray);

        // (If you wish to have both visual bullet objects and weapon fire effects,
        // you can combine the two approaches.)
    }

    resetGame() {
        // Reset game state.
        this.timeLeft = 60;
        this.score = 0;
        this.gameOver = false;

        // Remove all bullets.
        this.bulletArray.forEach(bullet => this.scene.remove(bullet));
        this.bulletArray = [];

        // Remove all enemy meshes.
        this.enemyArray.forEach(enemy => this.scene.remove(enemy.mesh));
        this.enemyArray = [];
        this.createEnemies();
    }

    spawnEnemy() {
        const newEnemy = this.enemySpawnManager.spawnEnemy();
        this.enemyArray.push(newEnemy);
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
        for (let i = this.bulletArray.length - 1; i >= 0; i--) {
            const bullet = this.bulletArray[i];
            bullet.position.add(bullet.userData.velocity);
            if (bullet.position.distanceTo(this.camera.position) > 20) {
                this.scene.remove(bullet);
                this.bulletArray.splice(i, 1);
            }
        }

        // Check for collisions between any bullets and enemies.
        const bulletsToRemove = [];
        for (let i = this.bulletArray.length - 1; i >= 0; i--) {
            const bullet = this.bulletArray[i];
            for (let j = this.enemyArray.length - 1; j >= 0; j--) {
                const enemy = this.enemyArray[j];
                if (!enemy.isExploding) {
                    if (bullet.position.distanceTo(enemy.mesh.position) < 0.28) {
                        enemy.explode();
                        this.onEnemyDestroyed(enemy);
                        bulletsToRemove.push(i);
                        break;
                    }
                }
            }
        }

        // Remove bullets that collided with enemies.
        bulletsToRemove.forEach(index => {
            const bullet = this.bulletArray[index];
            this.scene.remove(bullet);
            this.bulletArray.splice(index, 1);
        });

        // Update enemies.
        for (let i = this.enemyArray.length - 1; i >= 0; i--) {
            const enemy = this.enemyArray[i];
            if (enemy.update(delta)) {
                // Once an enemy has finished its explosion, remove it and spawn a new one.
                this.scene.remove(enemy.mesh);
                this.enemyArray.splice(i, 1);
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
