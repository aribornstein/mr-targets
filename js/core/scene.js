// js/core/scene.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

export function createScene() {
  const scene = new THREE.Scene();

  // Add ambient lighting.
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  hemiLight.position.set(0.5, 1, 0.25);
  scene.add(hemiLight);

  return scene;
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(0, 1.6, 0);
  return camera;
}

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Create ARButton so that passthrough and AR session work.
  document.body.appendChild(
    ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test", "bounded-floor"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body }
    })
  );

  return renderer;
}
