import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Three.js Wave Animation
let scene, camera, renderer, torus,waves, particlesMesh, pos, controls, simplex, parentContainer,phase=0, mousePos = { x: 0.5, y: 0.5 };

function initThree() {
  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight);
  camera.position.set(4, 2, 8);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(6, 4, 150, 100);
  pos = geometry.getAttribute('position');
  simplex = new SimplexNoise();

  waves = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 0.04, color: 0x4682b4 }) // Steel blue for dark theme
  );
  waves.rotation.x = -Math.PI / 2;
  scene.add(waves);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animationLoop(t) {
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = 0.20 * simplex.noise3d(x / 2, y / 2, t / 2000);
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  renderer.render(scene, camera);
}

function initThreeTaurus() {
  var canvReference = document.getElementById("animation-canvas-contact");
  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 2);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvReference, alpha:true });//
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  const torusGeometry = new THREE.TorusGeometry(0.7, 0.25, 30, 150);

  const material = new THREE.PointsMaterial({
	size: 0.01,
	color: 0x4682b4 // Steel blue
  });

  torus = new THREE.Points(torusGeometry, material);
  scene.add(torus);

  const pointLight = new THREE.PointLight(0xffffff, 0.1);
  pointLight.position.set(2, 3, 4);
  scene.add(pointLight);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

function animationLoopTaurus(t) {
  torus.rotation.y = -0.5 * t / 1000;
  torus.rotation.x = -0.5 * t / 1000;
  controls.update();
  renderer.render(scene, camera);
}

function initThreeShapes() {
  var canvReference = document.getElementById("animation-canvas-services");
  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvReference, alpha:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  const boxSize = 0.1;
  const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  const material = new THREE.MeshBasicMaterial({
	transparent: true,
	color:  0x4682b4, // Red, as in original
	opacity: 0.7,
  });

  parentContainer = new THREE.Object3D();
  scene.add(parentContainer);

  const pitchSegments = 120;
  const elevationSegments = pitchSegments / 2;
  const particles = pitchSegments * elevationSegments;
  const side = Math.pow(particles, 1/3);
  const radius = 16;

  function posInBox(place) {
	return ((place / side) - 0.5) * radius * 1.2;
  }

  for (let p = 0; p < pitchSegments; p++) {
	const pitch = Math.PI * 2 * p / pitchSegments;
	for (let e = 0; e < elevationSegments; e++) {
	  const elevation = Math.PI * ((e / elevationSegments) - 0.5);
	  const particle = new THREE.Mesh(geometry, material);

	  parentContainer.add(particle);

	  const dest = new THREE.Vector3();
	  dest.z = (Math.sin(pitch) * Math.cos(elevation)) * radius;
	  dest.x = (Math.cos(pitch) * Math.cos(elevation)) * radius;
	  dest.y = Math.sin(elevation) * radius;

	  particle.position.x = posInBox(parentContainer.children.length % side);
	  particle.position.y = posInBox(Math.floor(parentContainer.children.length / side) % side);
	  particle.position.z = posInBox(Math.floor(parentContainer.children.length / Math.pow(side, 2)) % side);
	  particle.userData = { dests: [dest, particle.position.clone()], speed: new THREE.Vector3() };
	}
  }

  if (typeof THREE.OrbitControls === 'undefined') {
	console.error('OrbitControls is not defined');
	return;
  }

  try {
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	console.log('OrbitControls initialized successfully');
  } catch (e) {
	console.error('Failed to initialize OrbitControls:', e);
  }

  // Mouse movement for rotation
  const mousePos = { x: 0.5, y: 0.5 };
  document.addEventListener('mousemove', (event) => {
	mousePos.x = event.clientX / window.innerWidth;
	mousePos.y = event.clientY / window.innerHeight;
  });

  window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

function animationLoopShapes(t) {
  phase += 0.002;
  for (let i = 0, l = parentContainer.children.length; i < l; i++) {
	const particle = parentContainer.children[i];
	const dest = particle.userData.dests[Math.floor(phase) % particle.userData.dests.length].clone();
	const diff = dest.sub(particle.position);
	particle.userData.speed.divideScalar(1.02); // Drag
	particle.userData.speed.add(diff.divideScalar(400)); // Speed towards dest
	particle.position.add(particle.userData.speed);
	particle.lookAt(dest);
  }

  parentContainer.rotation.y = phase * 3;
  parentContainer.rotation.x = (mousePos.y - 0.5) * Math.PI;
  parentContainer.rotation.z = (mousePos.x - 0.5) * Math.PI;

  if (controls) {
	controls.update();
  }
  renderer.render(scene, camera);
}


// Theme Toggle and Clock
function initUI() {
  const buttons = document.querySelectorAll('.theme-button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.dataset.theme;
      document.body.className = theme;
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      localStorage.setItem('theme', theme);
      updateTheme(theme);
    });
  });

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = savedTheme;
  buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === savedTheme));
  updateTheme(savedTheme);

  // GSAP Animation
  gsap.from('.content', { opacity: 0, y: 20, duration: 1.5 });
}

// Update particle color based on theme
function updateTheme(theme) {
	if (page === 'index.html'){
		waves.material.color.set(theme === 'dark' ? 0x4682b4 : 0x87ceeb); // Steel blue (dark) or sky blue (light)
		//scene.background = new THREE.Color(theme === 'dark' ? 'black' : 'white');
	}
	else if (page === 'contact.html'){
		//scene.background = new THREE.Color(theme === 'dark' ? 'black' : 'white');
	}
	else if (page === 'services.html'){
		//scene.background = new THREE.Color(theme === 'dark' ? 'black' : 'white');
	}
}

// Project Selection (for projects.html)
function initProjects() {
  if (document.getElementById('project-detail')) {
    const projects = [
      { id: 1, title: 'Project One', date: 'Apr.2025', role: 'Design & Dev', description: 'A futuristic web app with dynamic visuals.', image: 'https://via.placeholder.com/300x200?text=Project+One', url: '#' },
      { id: 2, title: 'Project Two', date: 'Mar.2025', role: 'Design & Dev', description: 'An interactive portfolio site.', image: 'https://via.placeholder.com/300x200?text=Project+Two', url: '#' },
      { id: 3, title: 'Project Three', date: 'Oct.2024', role: 'Design & Dev', description: 'A sleek e-commerce platform.', image: 'https://via.placeholder.com/300x200?text=Project+Three', url: '#' }
    ];

    function selectProject(id) {
      const project = projects.find(p => p.id === id);
      const detail = document.getElementById('project-detail');
      detail.innerHTML = `
        <img src="${project.image}" alt="${project.title}">
        <div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <a href="${project.url}" class="pop-out-link" target="_blank">Pop Out</a>
        </div>
      `;
      document.querySelectorAll('.project-item').forEach(item => item.classList.remove('active'));
      document.querySelector(`.project-item[onclick="selectProject(${id})"]`).classList.add('active');
      gsap.from('.project-detail', { opacity: 0, y: 20, duration: 0.5 });
    }

    selectProject(1);

    document.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.getAttribute('onclick').match(/\d+/)[0]);
        selectProject(id);
      });
    });
  }
}

// Initialize
const page = window.location.pathname.split('/').pop() || 'index.html';
if (page === 'index.html'){
	initThree();
	animate();
}
else if (page === 'contact.html'){
	initThreeTaurus();
	animateTaurus(0);
}
else if (page=== 'services.html'){
	initThreeShapes();
	animateShapes(0);
}
// Initialize

initUI();
initProjects();

// Animation Loop
function animate(t) {
  requestAnimationFrame(animate);
  animationLoop(t);
}

function animateTaurus(t) {
  requestAnimationFrame(animateTaurus);
  animationLoopTaurus(t);
}
function animateShapes(t) {
  requestAnimationFrame(animateShapes);
  animationLoopShapes(t);
}