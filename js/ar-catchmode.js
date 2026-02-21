// ar-catchmode.js
import { showScreen } from './app.js';
import { state } from './config.js';

let cameraStream = null;
let threeRenderer = null;
let threeScene = null;
let threeCamera = null;
let animationFrameId = null;
let monsterModel = null;

// ─── Camera ───────────────────────────────────────────────────────────────────
async function startCamera() {
    const video = document.getElementById('ar-catchmode-feed');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('📷 Camera not supported');
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = cameraStream;
        console.log('📷 Catch mode camera started');
    } catch (err) {
        console.log('❌ Camera error:', err);
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = document.getElementById('ar-catchmode-feed');
    if (video) video.srcObject = null;
}

// ─── Three.js Setup ───────────────────────────────────────────────────────────
function initThreeJS() {
    const canvas = document.getElementById('ar-three-canvas');
    if (!canvas) return;

    threeScene = new THREE.Scene();

    threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    threeCamera.position.set(0, 0, 3);

    threeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.setPixelRatio(window.devicePixelRatio);
    threeRenderer.setClearColor(0x000000, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    threeScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    threeScene.add(directionalLight);

    console.log('🎮 Three.js initialized');
}

// ─── Load 3D Monster ──────────────────────────────────────────────────────────
function loadMonster(monsterType) {
    const loader = new THREE.GLTFLoader();
    const modelPath = `css/images/ar-elements/${monsterType}.glb`;

    console.log(`👾 Loading 3D model: ${modelPath}`);

    loader.load(
        modelPath,
        (gltf) => {
            if (monsterModel) threeScene.remove(monsterModel);
            monsterModel = gltf.scene;
            monsterModel.scale.set(1, 1, 1);
            monsterModel.position.set(0, 0, 0);
            threeScene.add(monsterModel);
            console.log(`✅ 3D model loaded: ${monsterType}`);
            animate();
        },
        (progress) => {
            console.log(`⏳ Loading: ${Math.round(progress.loaded / progress.total * 100)}%`);
        },
        (error) => {
            console.log('❌ GLB load error — falling back to PNG:', error);
            fallbackToSprite(monsterType);
        }
    );
}

// ─── Fallback to PNG if GLB fails ─────────────────────────────────────────────
function fallbackToSprite(monsterType) {
    const sprite = document.getElementById('ar-catchmode-monster-sprite');
    if (sprite) {
        sprite.src = `css/images/ar-elements/catch${monsterType}.png`;
        sprite.style.display = 'block';
    }
}

// ─── Animation Loop ───────────────────────────────────────────────────────────
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (monsterModel) monsterModel.rotation.y += 0.01;
    threeRenderer.render(threeScene, threeCamera);
}

function stopAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (monsterModel && threeScene) {
        threeScene.remove(monsterModel);
        monsterModel = null;
    }
}

// ─── Render monster from state ────────────────────────────────────────────────
function renderMonster() {
    const monster = state.activeMonster;
    if (!monster) {
        console.log('⚠️ No active monster in state');
        return;
    }
    console.log(`👾 Rendering monster: ${monster.monsterType}`);
    initThreeJS();
    loadMonster(monster.monsterType);
}

// ─── Handle resize ────────────────────────────────────────────────────────────
function handleResize() {
    if (threeCamera && threeRenderer) {
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
function setupButtons() {
    document.getElementById('ar-catchmode-exit-btn')?.addEventListener('click', () => {
        stopCamera();
        stopAnimation();
        showScreen('ar-screen');
    });
}

// ─── MutationObserver ─────────────────────────────────────────────────────────
const screen = document.getElementById('ar-catchmode-screen');
if (screen) {
    const observer = new MutationObserver(() => {
        if (screen.classList.contains('active')) {
            startCamera();
            renderMonster();
            setupButtons();
            window.addEventListener('resize', handleResize);
        } else {
            stopCamera();
            stopAnimation();
            window.removeEventListener('resize', handleResize);
        }
    });
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}

console.log('AR catchmode initialized');