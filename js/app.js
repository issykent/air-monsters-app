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

// URL hash routing for development
function handleHashRoute() {
    const hash = window.location.hash.substring(1); // Remove the #
    
    if (hash) {
        console.log('Hash route detected:', hash);
        
        // Map of hash names to screen IDs
        const routes = {
            'loading': 'loading-screen',
            'landing': 'landing-screen',
            'login': 'login-form-screen',
            'customiser': 'customiser-screen',
            'create-account-info': 'create-account-info-screen',
            'home': 'home-screen',
            'map': 'map-screen',
            'ar': 'ar-screen',
            'user': 'user-window-screen'
        };
        
        if (routes[hash]) {
            showScreen(routes[hash]);
        }
    }
}

// Check hash on page load
handleHashRoute();

// Listen for hash changes
window.addEventListener('hashchange', handleHashRoute);
