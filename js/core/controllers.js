// js/core/controllers.js
export function setupControllers(scene, camera, renderer) {
    // Controllers for left and right hands.
    const controllerLeft = renderer.xr.getController(0);
    const controllerRight = renderer.xr.getController(1);
  
    // For now, we simply attach an event listener that forwards the "select" event.
    // The GameManager will handle these events.
    controllerLeft.addEventListener('select', (event) => {
      scene.dispatchEvent({ type: 'controllerSelect', controller: controllerLeft });
    });
    controllerRight.addEventListener('select', (event) => {
      scene.dispatchEvent({ type: 'controllerSelect', controller: controllerRight });
    });
  
    // Optionally, add the controllers to the scene.
    scene.add(controllerLeft);
    scene.add(controllerRight);
  }
  