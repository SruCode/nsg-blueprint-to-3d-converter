import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { CameraControls } from './controls.js';

let WALL_HEIGHT = 3.0;
let WALL_THICKNESS = 0.2;
const SCALE_FACTOR = 0.02;

const container = document.getElementById('threejs-container') || document.body;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

export const camera = new THREE.PerspectiveCamera(
  75, 
  container.clientWidth / container.clientHeight, 
  0.1, 
  1000
);
camera.position.set(5, 5, 15);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x00ffcc, 0.8);
dirLight.position.set(20, 40, 20);
dirLight.castShadow = true;
scene.add(dirLight);

const gridHelper = new THREE.GridHelper(100, 50, 0x00ffcc, 0x334155);
scene.add(gridHelper);

const wallGroup = new THREE.Group();
scene.add(wallGroup);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xdc143c, roughness: 0.4 });

export function loadWalls(wallData) {
  while (wallGroup.children.length > 0) {
    const obj = wallGroup.children.pop();
    if (obj.geometry) obj.geometry.dispose();
  }

  const heightInput = document.getElementById('wallHeight');
  const thicknessInput = document.getElementById('wallThickness');
  
  if (heightInput) WALL_HEIGHT = parseFloat(heightInput.value) || 3.0;
  if (thicknessInput) WALL_THICKNESS = parseFloat(thicknessInput.value) || 0.2;

  const placeholder = document.getElementById('threejsPlaceholder');
  if (placeholder) placeholder.style.display = 'none';

  wallData.forEach(wall => {
    const x1 = wall.x1 * SCALE_FACTOR;
    const z1 = wall.y1 * SCALE_FACTOR;
    const x2 = wall.x2 * SCALE_FACTOR;
    const z2 = wall.y2 * SCALE_FACTOR;

    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    if (length === 0) return;

    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    const angle = Math.atan2(dz, dx);

    const wallGeo = new THREE.BoxGeometry(length, WALL_HEIGHT, WALL_THICKNESS);
    const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);

    wallMesh.position.set(midX, WALL_HEIGHT / 2, midZ);
    wallMesh.rotation.y = -angle;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    wallGroup.add(wallMesh);
  });

  const statsEl = document.getElementById('renderStats');
  if (statsEl) statsEl.textContent = `FPS: 60 | WALLS: ${wallData.length}`;

  const engineBadge = document.getElementById('engineBadge');
  if (engineBadge) engineBadge.innerHTML = '<span class="card__badge-dot"></span> 3D RECONSTRUCTED';
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();