// ar.js
import { showScreen } from './app.js';
import { state } from './config.js';
import { monsterLocations, getMonsterFromAQI } from './monsters.js';

let cameraStream = null;
let gpsWatchId = null;
let nearestMonster = null;

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

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function startGPS() {
    if (!navigator.geolocation) {
        console.log('❌ GPS not supported');
        return;
    }

    gpsWatchId = navigator.geolocation.watchPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            console.log(`📍 User position: ${userLat}, ${userLon}`);
            checkProximity(userLat, userLon);
        },
        (err) => console.log('❌ GPS error:', err),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );
}

function stopGPS() {
    if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        gpsWatchId = null;
    }
}

function checkProximity(userLat, userLon) {
    const catchBtn = document.getElementById('enter-catch-mode-btn');
    const distanceDisplay = document.getElementById('ar-distance-display');
    console.log('🔍 catchBtn found:', !!catchBtn);

    let closest = null;
    let closestDist = Infinity;

    monsterLocations.forEach(monster => {
        const dist = getDistance(userLat, userLon, monster.lat, monster.lon);
        if (dist < closestDist) {
            closestDist = dist;
            closest = monster;
        }
    });

    console.log('🔍 closestDist:', closestDist);

    nearestMonster = closest;

    if (distanceDisplay && closest) {
        distanceDisplay.textContent = closestDist < 1000
            ? `${Math.round(closestDist)}m from ${closest.name}`
            : `${(closestDist / 1000).toFixed(1)}km from ${closest.name}`;
    }

    if (catchBtn) {
        catchBtn.style.display = closestDist <= 500 ? 'block' : 'none';
        if (closestDist <= 500) console.log('🎯 Monster within 500m! Showing catch button');
    }
}

function enterCatchMode() {
    if (!nearestMonster) return;
    state.activeMonster = nearestMonster;
    stopGPS();
    showScreen('ar-catchmode-screen');
}

function setupARButtons() {
    document.getElementById('ar-exit-btn')?.addEventListener('click', () => {
        stopCamera();
        stopGPS();
        showScreen('home-screen');
    });

    document.getElementById('enter-catch-mode-btn')?.addEventListener('click', () => {
        enterCatchMode();
    });
}

const screen = document.getElementById('ar-screen');
if (screen) {
    const observer = new MutationObserver(() => {
        if (screen.classList.contains('active')) {
            startCamera();
            startGPS();
            setupARButtons();
        } else {
            stopCamera();
            stopGPS();
        }
    });
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}

console.log('AR initialized');
