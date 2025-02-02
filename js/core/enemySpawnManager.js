import EnemyTypeA from '../entities/enemies/EnemyTypeA.js';
import EnemyTypeB from '../entities/enemies/EnemyTypeB.js';

export default class EnemySpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.enemyArray = [];
  }

  // Spawns an enemy of random type
  spawnEnemy() {
    const enemyType = Math.random() < 0.5 ? 'A' : 'B';
    let enemy;
    if (enemyType === 'A') {
      enemy = new EnemyTypeA();
    } else {
      enemy = new EnemyTypeB();
    }

    // Optionally, you can set a random spawn position.
    enemy.mesh.position.set(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    );

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
}