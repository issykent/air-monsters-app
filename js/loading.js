/* Loading Screen Logic */

import { showScreen } from './app.js';

let initialLoadTimer = null;
let transitionTimer = null;

function initLoading() {
    console.log('🟢 Loading initialized');
    
    window.startLoading = function(destination) {
        console.log('🔴 startLoading called for:', destination);
        
        // Clear timers
        if (initialLoadTimer) clearTimeout(initialLoadTimer);
        if (transitionTimer) clearTimeout(transitionTimer);
        
        // Show loading screen
        showScreen('loading-screen');
        
        // NUCLEAR OPTION: Use a tiny setTimeout to force rendering
        setTimeout(() => {
            console.log('🔴 Loading screen should be visible now');
            resetLoadingAnimation();
            
            // Start actual timer
            transitionTimer = setTimeout(() => {
                console.log('🟢 Going to:', destination);
                showScreen(destination);
            }, 3000);
        }, 50); // 50ms delay to ensure render
    };
    
    // Initial load
    initialLoadTimer = setTimeout(() => {
        console.log('🟢 Going to landing');
        showScreen('landing-screen');
        initialLoadTimer = null;
    }, 3000);
}

function resetLoadingAnimation() {
    const loadingBar = document.querySelector('.loading-bar-fill');
    if (loadingBar) {
        loadingBar.style.animation = 'none';
        void loadingBar.offsetWidth;
        loadingBar.style.animation = '';
    }
}

initLoading();