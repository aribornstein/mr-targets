// js/core/controllers.js
export function setupControllers(renderer, scene, onSelectCallback) {
  const controllerLeft = renderer.xr.getController(0);
  controllerLeft.addEventListener("select", onSelectCallback);
  scene.add(controllerLeft);

  const controllerRight = renderer.xr.getController(1);
  controllerRight.addEventListener("select", onSelectCallback);
  scene.add(controllerRight);
}
