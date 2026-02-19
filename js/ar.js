// ar.js
import { showScreen } from './app.js';

let cameraStream = null;

async function startCamera() {
    const video = document.getElementById('ar-camera-feed');
    const permissionMsg = document.getElementById('ar-permission-denied');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('📷 Camera not supported on this device/browser');
        if (permissionMsg) permissionMsg.style.display = 'block';
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = cameraStream;
        console.log('📷 Camera started');
    } catch (err) {
        console.log('❌ Camera permission denied:', err);
        if (permissionMsg) permissionMsg.style.display = 'block';
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = document.getElementById('ar-camera-feed');
    if (video) video.srcObject = null;
}

function setupARButtons() {
    document.getElementById('ar-exit-btn')?.addEventListener('click', () => {
        stopCamera();
        showScreen('home-screen');
    });
}

const screen = document.getElementById('ar-screen');
if (screen) {
    const observer = new MutationObserver(() => {
        if (screen.classList.contains('active')) {
            startCamera();
            setupARButtons();
        } else {
            stopCamera();
        }
    });
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}

console.log('AR initialized');
