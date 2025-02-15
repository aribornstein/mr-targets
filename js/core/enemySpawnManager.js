import EnemyTypeA from '../entities/enemies/EnemyTypeA.js';
import EnemyTypeB from '../entities/enemies/EnemyTypeB.js';
import EnemyTypeC from '../entities/enemies/EnemyTypeC.js';
import EnemyTypeD from '../entities/enemies/EnemyTypeD.js';

export default class EnemySpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.enemyArray = [];
    // NEW: Room boundary as a polygon (array of points {x, y}).
    this.roomBoundary = null;
  }

  // NEW: Allow external update of room boundary.
  setRoomBoundary(polygon) {
    this.roomBoundary = polygon;
  }

  // Helper: Determines if a 2D point is inside a polygon (ray-casting).
  isPointInPolygon(point, polygon) {
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

  // NEW: Helper to generate a random point inside the room boundary.
  getRandomPointInPolygon(polygon) {
    // Compute a bounding box.
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    polygon.forEach(pt => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });
    let pt;
    do {
      pt = { x: minX + Math.random() * (maxX - minX), y: minY + Math.random() * (maxY - minY) };
    } while (!this.isPointInPolygon(pt, polygon));
    return pt;
  }

  // Spawns an enemy of random type.
  spawnEnemy() {
    const enemyType = Math.random();
    let enemy;
    if (enemyType < 0.25) {
      enemy = new EnemyTypeA();
    } else if (enemyType < 0.5) {
      enemy = new EnemyTypeB();
    } else if (enemyType < 0.75) {
      enemy = new EnemyTypeC();
    } else {
      enemy = new EnemyTypeD();
    }

    let spawnX, spawnZ;
    if (this.roomBoundary) {
      // NEW: Use room boundary to decide a spawn position.
      const pt = this.getRandomPointInPolygon(this.roomBoundary);
      spawnX = pt.x;
      spawnZ = pt.y;
    } else {
      // ...existing code...
      spawnX = (Math.random() - 0.5) * 10;
      spawnZ = (Math.random() - 0.5) * 10;
    }
    enemy.mesh.position.set(spawnX, 0, spawnZ);

    this.scene.add(enemy.mesh);
    this.enemyArray.push(enemy);
    return enemy;
  }

  // Removes the enemy from the scene and internal array
  removeEnemy(enemy) {
    const index = this.enemyArray.indexOf(enemy);
    if (index > -1) {
      this.scene.remove(enemy.mesh);
      this.enemyArray.splice(index, 1);
    }
  }

  // Called when an enemy is destroyed, then respawns one after a delay.
  onEnemyDestroyed(enemy) {
    this.removeEnemy(enemy);
    setTimeout(() => {
      this.spawnEnemy();
    }, 1000);
  }

  // Clears all enemies from the scene.
  clearEnemies() {
    this.enemyArray.forEach(enemy => this.scene.remove(enemy.mesh));
    this.enemyArray = [];
  }

  // Update all enemies and handle their removal if needed
  updateEnemies(delta) {
    for (let i = this.enemyArray.length - 1; i >= 0; i--) {
      const enemy = this.enemyArray[i];
      // NEW: If room boundary is defined, check that enemy remains within bounds.
      if (this.roomBoundary) {
        const pos2D = { x: enemy.mesh.position.x, y: enemy.mesh.position.z };
        if (!this.isPointInPolygon(pos2D, this.roomBoundary)) {
          this.removeEnemy(enemy);
          this.spawnEnemy();
          continue;
        }
      }
      if (enemy.update(delta)) {
        this.removeEnemy(enemy);
        this.spawnEnemy();
      }
    }
  }

  // Spawns initial set of enemies
  spawnInitialEnemies(number_of_enemies = 5) {
    this.clearEnemies();
    for (let i = 0; i < number_of_enemies; i++) {
      this.spawnEnemy();
    }
  }
}