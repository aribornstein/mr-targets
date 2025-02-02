import EnemyTypeA from '../entities/enemies/EnemyTypeA.js';
import EnemyTypeB from '../entities/enemies/EnemyTypeB.js';
import EnemyTypeC from '../entities/enemies/EnemyTypeC.js';
import EnemyTypeD from '../entities/enemies/EnemyTypeD.js';

export default class EnemySpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.enemyArray = [];
  }

  // Spawns an enemy of random type
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

  // Update all enemies and handle their removal if needed
  updateEnemies(delta) {
    for (let i = this.enemyArray.length - 1; i >= 0; i--) {
      const enemy = this.enemyArray[i];
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