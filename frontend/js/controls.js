import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class CameraControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    // Basic control setup placeholder
  }
}

// Attach controls to camera and canvas
const controls = new PointerLockControls(camera, renderer.domElement);

// Lock mouse cursor when user clicks canvas
renderer.domElement.addEventListener('click', () => {
  controls.lock();
});

// WASD Key State Tracker
const moveState = { forward: false, backward: false, left: false, right: false };
const velocity = [0, 0, 0];
const MOVE_SPEED = 12.0;

document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') moveState.forward = true;
  if (e.code === 'KeyS') moveState.backward = true;
  if (e.code === 'KeyA') moveState.left = true;
  if (e.code === 'KeyD') moveState.right = true;
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') moveState.forward = false;
  if (e.code === 'KeyS') moveState.backward = false;
  if (e.code === 'KeyA') moveState.left = false;
  if (e.code === 'KeyD') moveState.right = false;
});

let prevTime = performance.now();

// Game Loop
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  const delta = (time - prevTime) / 1000;

  if (controls.isLocked) {
    // Apply friction/deceleration
    velocity[0] -= velocity[0] * 10.0 * delta;
    velocity[2] -= velocity[2] * 10.0 * delta;

    const dirZ = Number(moveState.forward) - Number(moveState.backward);
    const dirX = Number(moveState.right) - Number(moveState.left);

    if (moveState.forward || moveState.backward) velocity[2] -= dirZ * MOVE_SPEED * delta;
    if (moveState.left || moveState.right) velocity[0] -= dirX * MOVE_SPEED * delta;

    controls.moveRight(-velocity[0] * delta);
    controls.moveForward(-velocity[2] * delta);
  }

  prevTime = time;
  renderer.render(scene, camera);
}

animate();
