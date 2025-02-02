// js/main.js
import GameManager from './core/gameManager.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

const gameManager = new GameManager();
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const currentTime = clock.elapsedTime;
  gameManager.update(delta, currentTime);
  // Use the renderer's setAnimationLoop for XR compatibility.
  gameManager.renderer.setAnimationLoop(animate);
}

animate();
