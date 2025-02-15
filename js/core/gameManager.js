import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { createScene, createCamera, createRenderer } from './scene.js';
import { setupControllers } from './controllers.js';
import { createUIPanel, updateUIPanel } from './ui.js';
import PelletGun from '../entities/weapons/PelletGun.js';
import LaserGun from '../entities/weapons/LaserGun.js'; // Import another weapon
import EnemySpawnManager from './enemySpawnManager.js';

const clock = new THREE.Clock();

export default class GameManager {
    constructor() {
        // Create scene, camera, and renderer.
        this.scene = createScene();
        this.camera = createCamera();
        this.renderer = createRenderer();

        // Set up controllers. The onSelect callback is bound to this instance.
        setupControllers(this.renderer, this.scene, this.onSelect.bind(this), this.onGripPress.bind(this));

        // Set up the in-world UI panel.
        createUIPanel(this.renderer, this.camera, this.scene);

        // Create the enemy spawn manager.
        this.enemySpawnManager = new EnemySpawnManager(this.scene);

        // Initialize game state.
        this.timeLeft = 60;
        this.score = 0;
        this.gameOver = false;

        // Instantiate a weapon (here a PelletGun).
        this.currentWeapon = new PelletGun({ fireRate: 2 });

        // Handle window resize.
        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.bulletArray = [];

        // NEW: When the AR session starts, update room boundary using the real AR bounds.
        this.renderer.xr.addEventListener('sessionstart', () => {
            const session = this.renderer.xr.getSession();
            if (session && session.boundsGeometry) {
                // Convert the bounds (DOMPointReadOnly) to an array of {x, y} points.
                // Here we map x -> x and use z (or y from AR space if provided) as y.
                const roomPolygon = session.boundsGeometry.map(pt => ({ x: pt.x, y: pt.z }));
                // Optionally store the room boundary.
                this.roomBoundary = roomPolygon;
                // Update the enemy spawn manager.
                if (this.enemySpawnManager.setRoomBoundary) {
                    this.enemySpawnManager.setRoomBoundary(roomPolygon);
                }
            }
            if (!this.gameStarted) {
                this.enemySpawnManager.spawnInitialEnemies();
                this.gameStarted = true;
            }
            // Start the render loop only after AR session starts
            this.renderer.setAnimationLoop(this.render.bind(this));
        });

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

    onGripPress(event) {
        // Switch weapon when the grip button is pressed.
        if (this.currentWeapon instanceof PelletGun) {
            this.currentWeapon = new LaserGun({ fireRate: 1 });
        } else {
            this.currentWeapon = new PelletGun({ fireRate: 2 });
        }
    }

    resetGame() {
        // Reset game state.
        this.timeLeft = 60;
        this.score = 0;
        this.gameOver = false;

        // Remove all bullets.
        this.bulletArray.forEach(bullet => this.scene.remove(bullet));
        this.bulletArray = [];

        // Clear and respawn enemies.
        this.enemySpawnManager.spawnInitialEnemies();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        const delta = clock.getDelta();

        // Only update the game if it's not over
        if (!this.gameOver) {
            this.updateGame(delta);
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
            for (let j = this.enemySpawnManager.enemyArray.length - 1; j >= 0; j--) {
                const enemy = this.enemySpawnManager.enemyArray[j];
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

        // Remove bullets that collided with enemies in descending order.
        bulletsToRemove.sort((a, b) => b - a).forEach(index => {
            const bullet = this.bulletArray[index];
            this.scene.remove(bullet);
            this.bulletArray.splice(index, 1);
        });

        // Update enemies.
        this.enemySpawnManager.updateEnemies(delta);

        // Update the UI panel.
        updateUIPanel(this.score, this.timeLeft, this.gameOver);

        // Render the scene.
        this.renderer.render(this.scene, this.camera);
    }

    updateGame(delta) {
        if (this.gameStarted) { // Only update if the game has started
            this.timeLeft -= delta;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.gameOver = true;
            }
            updateUIPanel(this.score, this.timeLeft, this.gameOver);
        }
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