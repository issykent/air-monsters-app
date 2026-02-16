import { state } from './config.js';

export function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        state.currentScreen = screenId;
        console.log('Switched to: ' + screenId);
    }
}

function init() {
    console.log('App initialized');
    // REMOVED: setTimeout(() => showScreen('customiser-screen'), 2000);
    // Let loading.js handle the initial screen flow
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.showScreen = showScreen;
