// user-window.js
import { showScreen } from './app.js';
import { getCurrentUserData, clearCurrentUser } from '../user-account-info/storage.js';
import { state } from './config.js';

// ─── Render the guardian avatar layers ───────────────────────────────────────
function renderUserWindowAvatar() {
    const container = document.getElementById('user-window-avatar-layers');
    if (!container) return;

    const userData = getCurrentUserData();
    if (!userData || !userData.guardian) return;

    const guardian = userData.guardian;
    container.innerHTML = '';

    function appendLayer(filename) {
        const img = document.createElement('img');
        img.src = `css/images/${filename}`;
        img.alt = '';
        container.appendChild(img);
    }

    if (guardian.style === 'style3') {
        // Tornado: Body → Accessory → Eyes
        appendLayer(`${guardian.style}/${guardian.style}-${guardian.color}.png`);
        if (guardian.accessory) {
            appendLayer(`${guardian.style}/${guardian.style}-${guardian.accessory}.png`);
        }
        appendLayer(`${guardian.style}/${guardian.style}-${guardian.eyes}.png`);
    } else {
        // Style 1 & 2: Body → Eyes → Accessory
        appendLayer(`${guardian.style}/${guardian.style}-${guardian.color}.png`);
        appendLayer(`${guardian.style}/${guardian.style}-${guardian.eyes}.png`);
        if (guardian.accessory) {
            appendLayer(`${guardian.style}/${guardian.style}-${guardian.accessory}.png`);
        }
    }

    // Set guardian name displays
    const displayName = guardian.name || 'Guardian';
    const nameEl = document.getElementById('guardian-display-name');
    const editNameEl = document.getElementById('edit-guardian-name');
    if (nameEl) nameEl.textContent = displayName;
    if (editNameEl) editNameEl.textContent = displayName;
}

// ─── Button handlers ──────────────────────────────────────────────────────────
function setupUserWindowButtons() {
    // Back to home
    document.getElementById('user-window-back-btn')?.addEventListener('click', () => {
        showScreen('home-screen');
    });

    // Hunt mode → placeholder for now
    document.getElementById('hunt-btn')?.addEventListener('click', () => {
        // showScreen('ar-screen'); // wire up later
        console.log('🎯 Hunt mode tapped');
    });

    // Edit guardian style
    document.getElementById('edit-style-btn')?.addEventListener('click', () => {
        state.customiserContext = 'editing';
        showScreen('customiser-screen');
    });

    // Tips → placeholder for now
    document.getElementById('tips-btn')?.addEventListener('click', () => {
        // open tips popup later
        console.log('💡 Tips tapped');
    });

    // Account settings → placeholder for now
    document.getElementById('account-settings-btn')?.addEventListener('click', () => {
        console.log('⚙️ Account settings tapped');
    });

    // Log out
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        clearCurrentUser();
        showScreen('landing-screen');
    });
}

// ─── MutationObserver — run when screen becomes active ────────────────────────
export function monitorUserWindow() {
    const screen = document.getElementById('user-window-screen');
    if (!screen) return;

    const observer = new MutationObserver(() => {
        if (screen.classList.contains('active')) {
            renderUserWindowAvatar();
            setupUserWindowButtons();
        }
    });

    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}