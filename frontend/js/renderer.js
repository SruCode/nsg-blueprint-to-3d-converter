import * as THREE from './libs/three.module.js';

const WALL_HEIGHT = 3.0;     // 3 meters tall
const WALL_THICKNESS = 0.2;  // 0.2 meters thick

const container = document.getElementById('threejs-container') || document.body;

// 1. Scene & Camera Setup
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

export const camera = new THREE.PerspectiveCamera(
  75, 
  container.clientWidth / container.clientHeight, 
  0.1, 
  1000
);
camera.position.set(5, 1.7, 12); // Eye level at 1.7m

// 2. WebGL Renderer
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// 3. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// 4. Floor Plane
const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 5. Wall Mesh Container
const wallGroup = new THREE.Group();
scene.add(wallGroup);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xdc143c, roughness: 0.5 });

// 6. Wall Extrusion Engine
export function loadWalls(wallData) {
  while (wallGroup.children.length > 0) {
    const obj = wallGroup.children.pop();
    if (obj.geometry) obj.geometry.dispose();
  }

  wallData.forEach(wall => {
    const x1 = wall.x1;
    const z1 = wall.y1; // 2D image Y -> 3D Z plane
    const x2 = wall.x2;
    const z2 = wall.y2;

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
}

// 7. Load local dummy data
fetch('./js/walls.json')
  .then(res => res.json())
  .then(data => loadWalls(data))
  .catch(err => console.error("Error loading initial walls.json:", err));
