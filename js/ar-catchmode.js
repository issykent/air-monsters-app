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
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    //window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                    //window.addEventListener('deviceorientation', handleOrientation, true);
                }
            })
            .catch(err => console.log('❌ Orientation permission denied:', err));
    } else {
        // window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        // window.addEventListener('deviceorientation', handleOrientation, true);
    }
}

function handleOrientation(event) {
    if (event.absolute && event.alpha !== null) {
        deviceHeading = (360 - event.alpha) % 360;
    } else if (event.webkitCompassHeading !== undefined) {
        deviceHeading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        deviceHeading = (360 - event.alpha) % 360;
    }
    updateMonsterPosition();
}

function updateCatchmodeCompass(e) {
    let heading = null;
    if (e.absolute && e.alpha !== null) {
        heading = 360 - e.alpha;
    } else if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
        heading = 360 - e.alpha;
    }
    if (heading === null) return;
    const arrow = document.getElementById('catchmode-compass-arrow');
    if (arrow) arrow.style.transform = `translate(-50%, -100%) rotate(${heading}deg)`;
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

    monsterModel.position.x = 0;
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
    const distance = state.activeMonsterDistance || 5;
    console.log(`👾 Loading 3D model: ${modelPath}`);

    loader.load(
        modelPath,
        (gltf) => {
            if (monsterModel) threeScene.remove(monsterModel);
            monsterModel = gltf.scene;
            const scale = Math.max(0.2, Math.min(2, 5 / distance)) * 0.5;
            monsterModel.scale.set(scale, scale, scale);
            monsterModel.position.set(1.5, -3.5, -2);

            monsterModel.traverse((child) => {
                if (child.isMesh) {
                    child.material.transparent = true;
                    child.material.opacity = 0;
                }
            });

            threeScene.add(monsterModel);
            animate();

            // 3 second delay then fade in over 2 seconds
            setTimeout(() => {
                const duration = 2000;
                const start = performance.now();
                function fadeIn() {
                    const elapsed = performance.now() - start;
                    const progress = Math.min(elapsed / duration, 1);
                    monsterModel?.traverse((child) => {
                        if (child.isMesh) child.material.opacity = progress;
                    });
                    if (progress < 1) requestAnimationFrame(fadeIn);
                }
                requestAnimationFrame(fadeIn);
            }, 3000);
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

// ─── Scan sequence ────────────────────────────────────────────────────────────
function startScanSequence() {
    const scanBar = document.getElementById('catchmode-scan-bar');
    const overlay = document.getElementById('catchmode-overlay');
    const exitBtn = document.getElementById('ar-catchmode-exit-btn');
    const tapText = document.getElementById('catchmode-tap-text');

    // Reset all to invisible
    if (overlay) overlay.style.opacity = '0';
    if (exitBtn) exitBtn.style.opacity = '0';
    if (tapText) tapText.style.opacity = '0';
    if (scanBar) {
        scanBar.style.display = 'block';
        // Restart animation by removing and re-adding
        scanBar.style.animation = 'none';
        requestAnimationFrame(() => {
            scanBar.style.animation = 'scanDown 5s linear forwards';
        });
    }

    // Fade overlay and exit btn immediately
    requestAnimationFrame(() => {
        if (overlay) overlay.style.opacity = '1';
        if (exitBtn) exitBtn.style.opacity = '1';
    });

    // Tap text starts fading in after 2 second delay, takes 3s to reach full opacity
    setTimeout(() => {
        if (tapText) tapText.style.opacity = '1';
    }, 2000);

    // Hide scan bar after 3s
    setTimeout(() => {
        if (scanBar) scanBar.style.display = 'none';
        startMotionDetection();
    }, 5000);
}

// ─── Motion detection — fade out tap text when user moves/rotates ─────────────
let motionListener = null;
let lastAlpha = null;
let motionFired = false;

function startMotionDetection() {
    if (motionFired) return;

    motionListener = (e) => {
        if (motionFired) return;

        let moved = false;

        // Check rotation (orientation change)
        if (e.alpha !== null) {
            if (lastAlpha === null) {
                lastAlpha = e.alpha;
            } else {
                let diff = Math.abs(e.alpha - lastAlpha);
                if (diff > 180) diff = 360 - diff;
                if (diff > 3) moved = true;
            }
        }

        // Check acceleration (movement)
        if (e.acceleration) {
            const { x, y, z } = e.acceleration;
            if (Math.abs(x) > 1.5 || Math.abs(y) > 1.5 || Math.abs(z) > 1.5) {
                moved = true;
            }
        }

        if (moved) {
            motionFired = true;
            const tapText = document.getElementById('catchmode-tap-text');
            if (tapText) tapText.style.opacity = '0';
            stopMotionDetection();
        }
    };

    window.addEventListener('devicemotion', motionListener, true);
    window.addEventListener('deviceorientation', motionListener, true);
}

function stopMotionDetection() {
    if (motionListener) {
        window.removeEventListener('devicemotion', motionListener, true);
        window.removeEventListener('deviceorientation', motionListener, true);
        motionListener = null;
    }
    lastAlpha = null;
    motionFired = false;
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
    setupTapToCatch();
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

// ─── CATCH CARD — add these functions to ar-catchmode.js ─────────────────────

// ─── Tap detection on Three.js canvas ────────────────────────────────────────
function setupTapToCatch() {
    const canvas = document.getElementById('ar-three-canvas');
    if (!canvas) return;

    canvas.addEventListener('click', onCanvasTap);
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        onCanvasTap(e.changedTouches[0]);
    }, { passive: false });
}

function onCanvasTap(event) {
    if (!monsterModel || !threeCamera || !threeRenderer) return;

    const canvas = threeRenderer.domElement;
    const rect = canvas.getBoundingClientRect();

    // Convert tap to normalised device coordinates (-1 to +1)
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // Raycast from camera through tap point
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, threeCamera);

    const intersects = raycaster.intersectObjects(monsterModel.children, true);

    if (intersects.length > 0) {
        console.log('🎯 Monster tapped — showing catch card!');
        showCatchCard();
    }
}

// ─── Save catch to localStorage ───────────────────────────────────────────────
function saveCatch(monsterType) {
    const data = JSON.parse(localStorage.getItem('airMonsters'));
    const username = data?.currentUser;
    if (!username) return;

    if (!data.users[username].catches) {
        data.users[username].catches = { totalCatches: 0, unlockedMonsters: [] };
    }

    data.users[username].catches.totalCatches += 1;
    if (!data.users[username].catches.unlockedMonsters.includes(monsterType)) {
        data.users[username].catches.unlockedMonsters.push(monsterType);
    }

    localStorage.setItem('airMonsters', JSON.stringify(data));
    console.log(`✅ Catch saved — total: ${data.users[username].catches.totalCatches}, unlocked: ${data.users[username].catches.unlockedMonsters}`);
}

// ─── Show catch card ──────────────────────────────────────────────────────────
function showCatchCard() {
    const monsterType = state.activeMonster?.monsterType || 'sprout';

    // Build overlay HTML
    const overlay = document.createElement('div');
    overlay.className = 'catch-card-overlay';
    overlay.id = 'catch-card-overlay';

    overlay.innerHTML = `
        <div class="catch-card-container">
            <div class="catch-card-inner" id="catch-card-inner">
                <div class="catch-card-back">
                    <img src="css/images/ar-elements/catchcards/${monsterType}catchcardback.png" alt="card back" />
                </div>
                <div class="catch-card-front">
                    <img src="css/images/ar-elements/catchcards/${monsterType}catchcard.png" alt="${monsterType} catch card" />
                </div>
            </div>
        </div>
        <div class="catch-card-buttons" id="catch-card-buttons">
            <button class="catch-card-btn secondary" id="catch-continue-btn">Keep Hunting</button>
            <button class="catch-card-btn primary" id="catch-home-btn">Go Home</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Fade in overlay
    requestAnimationFrame(() => {
        overlay.classList.add('visible');

        // Flip card after short delay
        setTimeout(() => {
            const cardInner = document.getElementById('catch-card-inner');
            if (cardInner) cardInner.classList.add('flipped');

            // Show buttons after flip completes
            setTimeout(() => {
                const buttons = document.getElementById('catch-card-buttons');
                if (buttons) buttons.classList.add('visible');
            }, 900);

        }, 400);
    });

    // Button handlers
    overlay.addEventListener('click', (e) => {
        if (e.target.id === 'catch-continue-btn') {
            saveCatch(monsterType);
            dismissCatchCard();
            import('./app.js').then(m => m.showScreen('ar-screen'));
        }
        if (e.target.id === 'catch-home-btn') {
            saveCatch(monsterType);
            dismissCatchCard();
            import('./app.js').then(m => m.showScreen('home-screen'));
        }
    });
}

function dismissCatchCard() {
    const overlay = document.getElementById('catch-card-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
    }
}

// ─── MutationObserver ─────────────────────────────────────────────────────────
const screen = document.getElementById('ar-catchmode-screen');
if (screen) {
    const observer = new MutationObserver(() => {
        if (screen.classList.contains('active')) {
            startCamera();
            renderMonster();
            setupButtons();
            startScanSequence();
            window.addEventListener('resize', handleResize);
        } else {
            stopCamera();
            stopAnimation();
            stopDeviceOrientation();
            stopMotionDetection();
            window.removeEventListener('resize', handleResize);
        }
    });
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}

console.log('AR catchmode initialized');