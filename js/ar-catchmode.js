// ar-catchmode.js
import { showScreen } from './app.js';
import { state } from './config.js';

let cameraStream = null;
let threeRenderer = null;
let threeScene = null;
let threeCamera = null;
let animationFrameId = null;
let monsterModel = null;
let deviceHeading = 0; // current compass heading of phone
let monsterBearing = 0; // bearing from user to monster

// ─── Camera ───────────────────────────────────────────────────────────────────
async function startCamera() {
    const video = document.getElementById('ar-catchmode-feed');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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

// ─── Bearing calculation (degrees from user to monster) ───────────────────────
function calculateBearing(userLat, userLon, monsterLat, monsterLon) {
    const φ1 = userLat * Math.PI / 180;
    const φ2 = monsterLat * Math.PI / 180;
    const Δλ = (monsterLon - userLon) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    console.log(`🧭 Monster bearing: ${Math.round(bearing)}°`);
    return bearing;
}

// ─── Device Orientation ───────────────────────────────────────────────────────
function startDeviceOrientation() {
    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                    window.addEventListener('deviceorientation', handleOrientation, true);
                }
            })
            .catch(err => console.log('❌ Orientation permission denied:', err));
    } else {
        // Android / non-iOS
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
    }
}

function handleOrientation(event) {
    // alpha = compass heading (0 = North, 90 = East etc)
    if (event.absolute && event.alpha !== null) {
        deviceHeading = (360 - event.alpha) % 360;
    } else if (event.webkitCompassHeading !== undefined) {
        // iOS fallback
        deviceHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        deviceHeading = (360 - event.alpha) % 360;
    }
    updateMonsterPosition();
}

function stopDeviceOrientation() {
    window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    window.removeEventListener('deviceorientation', handleOrientation, true);
}

// ─── Update monster X position based on heading vs bearing ───────────────────
function updateMonsterPosition() {
    if (!monsterModel || !threeCamera) return;

    // Angle difference between where phone points and where monster is
    let angleDiff = monsterBearing - deviceHeading;

    // Normalise to -180 to +180
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;

    // Convert angle to X offset in 3D space
    // 60° FOV means monster moves off screen at ~±30°
    const xOffset = Math.tan(angleDiff * Math.PI / 180) * 3;

    monsterModel.position.x = -xOffset;
    console.log(`📐 Heading: ${Math.round(deviceHeading)}° | Bearing: ${Math.round(monsterBearing)}° | Offset: ${xOffset.toFixed(2)}`);
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
        null,
        (error) => {
            console.log('❌ GLB load error — falling back to PNG:', error);
            fallbackToSprite(monsterType);
        }
    );
}

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

    // Calculate bearing from user's last known position to monster
    if (state.userLat && state.userLon) {
        monsterBearing = calculateBearing(state.userLat, state.userLon, monster.lat, monster.lon);
    } else {
        console.log('⚠️ No user position in state — monster will appear centred');
    }

    console.log(`👾 Rendering monster: ${monster.monsterType}`);
    initThreeJS();
    loadMonster(monster.monsterType);
    startDeviceOrientation();
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
        stopDeviceOrientation();
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
            stopDeviceOrientation();
            window.removeEventListener('resize', handleResize);
        }
    });
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}

console.log('AR catchmode initialized');