// js/main.js
import GameManager from './core/gameManager.js';

window.addEventListener('load', () => {
  // Instantiate the GameManager which sets up the scene, AR, controllers, UI, and game loop.
  new GameManager();
});
