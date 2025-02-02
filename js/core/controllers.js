export function setupControllers(renderer, scene, onSelect, onGripPress) {
  const controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelect);
  controller1.addEventListener('squeezestart', onGripPress); // Add grip press event listener
  scene.add(controller1);

  const controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelect);
  controller2.addEventListener('squeezestart', onGripPress); // Add grip press event listener
  scene.add(controller2);
}