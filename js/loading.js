/* Loading Screen Logic */

import { showScreen } from './app.js';
import { isLoggedIn } from '../user-account-info/auth.js';

let isInitialLoad = true;
let initialLoadTimer = null;
let transitionTimer = null;

function initLoading() {
    console.log('🟢 Loading initialized');
    
    // Make startLoading globally available
    window.startLoading = function(destination) {
        console.log('🟡 startLoading called for:', destination);
        
        // Clear timers
        if (initialLoadTimer) {
            clearTimeout(initialLoadTimer);
            initialLoadTimer = null;
        }
        if (transitionTimer) {
            clearTimeout(transitionTimer);
        }
        
        // Show loading screen
        showScreen('loading-screen');
        
        // Reset loading bar animation
        resetLoadingAnimation();
        
        // Start timer
        console.log('🟡 Starting timer to:', destination);
        transitionTimer = setTimeout(() => {
            console.log('🟢 Timer complete! Going to:', destination);
            showScreen(destination);
            transitionTimer = null;
        }, 1500);
    };
    
    // Handle initial page load
    if (isInitialLoad) {
        console.log('🟣 Initial page load - checking login status');
        isInitialLoad = false;
        
        // Check if user is logged in
        if (isLoggedIn()) {
            console.log('✅ User is logged in - going to home screen');
            initialLoadTimer = setTimeout(() => {
                showScreen('home-screen');
                initialLoadTimer = null;
            }, 1500);
        } else {
            console.log('🔓 No user logged in - going to landing screen');
            initialLoadTimer = setTimeout(() => {
                showScreen('landing-screen');
                initialLoadTimer = null;
            }, 1500);
        }
    }
}

// Reset loading bar animation
function resetLoadingAnimation() {
    const loadingBar = document.querySelector('.loading-bar-fill');
    if (loadingBar) {
        loadingBar.style.animation = 'none';
        void loadingBar.offsetWidth;
        loadingBar.style.animation = '';
    }
}

// Initialize immediately
initLoading();