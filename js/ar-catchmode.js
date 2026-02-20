// ar-catchmode.js
import { showScreen } from './app.js';
import { state } from './config.js';

let cameraStream = null;

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

// ─── Render monster sprite from state ────────────────────────────────────────
function renderMonster() {
    const monster = state.activeMonster;
    if (!monster) {
        console.log('⚠️ No active monster in state');
        return;
    }

    const sprite = document.getElementById('ar-catchmode-monster-sprite');
    const monsterType = monster.monsterType;
    sprite.src = `css/images/ar-elements/catch${monsterType}.png`;
    console.log(`👾 Rendering monster: ${monsterType}`);
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
function setupButtons() {
    document.getElementById('ar-catchmode-exit-btn')?.addEventListener('click', () => {
        stopCamera();
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
        } else {
            stopCamera();
        }
    });
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}

console.log('AR catchmode initialized');