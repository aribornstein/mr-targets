// js/core/ui.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

// For this example, we create an in-world UI panel that is placed on the wall.
// We use the XR bounded-floor (if available) to position the panel.
const uiCanvasWidth = 512;
const uiCanvasHeight = 256;
const fallbackPanelDistance = 3; // meters

let uiMesh, uiTexture, uiContext;

export function createUIPanel(scene, camera, renderer) {
  // Create a canvas.
  const canvas = document.createElement("canvas");
  canvas.width = uiCanvasWidth;
  canvas.height = uiCanvasHeight;
  uiContext = canvas.getContext("2d");

  uiTexture = new THREE.CanvasTexture(canvas);
  uiTexture.encoding = THREE.sRGBEncoding;

  const uiMaterial = new THREE.MeshBasicMaterial({
    map: uiTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const uiGeometry = new THREE.PlaneGeometry(1, 0.5);
  uiMesh = new THREE.Mesh(uiGeometry, uiMaterial);

  // Compute the panel position.
  const panelPos = computePanelPositionOnBoundary(renderer, camera);
  uiMesh.position.copy(panelPos);
  uiMesh.lookAt(camera.position);
  scene.add(uiMesh);
}

export function updateUIPanel(score, timeLeft, gameOver) {
  uiContext.clearRect(0, 0, uiCanvasWidth, uiCanvasHeight);
  uiContext.fillStyle = "rgba(0, 0, 0, 0.6)";
  uiContext.fillRect(0, 0, uiCanvasWidth, uiCanvasHeight);

  uiContext.font = "48px sans-serif";
  uiContext.fillStyle = "white";
  uiContext.textAlign = "left";
  uiContext.fillText("Time: " + Math.floor(timeLeft) + " sec", 20, 80);
  uiContext.fillText("Score: " + score, 20, 150);

  if (gameOver) {
    uiContext.font = "64px sans-serif";
    uiContext.fillStyle = "red";
    uiContext.textAlign = "center";
    uiContext.fillText("GAME OVER", uiCanvasWidth / 2, uiCanvasHeight / 2);
    uiContext.font = "48px sans-serif";
    uiContext.fillText("Tap any controller to Restart", uiCanvasWidth / 2, uiCanvasHeight / 2 + 60);
  }
  uiTexture.needsUpdate = true;
}

function computePanelPositionOnBoundary(renderer, camera) {
  const refSpace = renderer.xr.getReferenceSpace();
  if (refSpace && refSpace.boundsGeometry && refSpace.boundsGeometry.length > 0) {
    // Convert bounds to 2D points on the XZ plane.
    const points = refSpace.boundsGeometry.map(pt => new THREE.Vector2(pt.x, pt.z));
    if (!points[0].equals(points[points.length - 1])) {
      points.push(points[0].clone());
    }
    const camPos2D = new THREE.Vector2(camera.position.x, camera.position.z);
    const forward3D = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const forward2D = new THREE.Vector2(forward3D.x, forward3D.z).normalize();

    let closestT = Infinity;
    let intersection2D = null;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const s = p2.clone().sub(p1);
      const denominator = forward2D.x * s.y - forward2D.y * s.x;
      if (denominator === 0) continue;
      const diff = p1.clone().sub(camPos2D);
      const t = (diff.x * s.y - diff.y * s.x) / denominator;
      const u = (diff.x * forward2D.y - diff.y * forward2D.x) / denominator;
      if (t >= 0 && u >= 0 && u <= 1 && t < closestT) {
        closestT = t;
        intersection2D = camPos2D.clone().add(forward2D.clone().multiplyScalar(t));
      }
    }
    if (intersection2D) {
      return new THREE.Vector3(intersection2D.x, 1.6, intersection2D.y);
    }
  }
  // Fallback position.
  const fallbackPos = new THREE.Vector3();
  camera.getWorldDirection(fallbackPos);
  fallbackPos.multiplyScalar(fallbackPanelDistance).add(camera.position);
  fallbackPos.y = 1.6;
  return fallbackPos;
}
