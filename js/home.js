/* Home Screen Logic */

import { showScreen } from './app.js';
import { getCurrentUserData } from '../user-account-info/storage.js';

function setupHuntButtons() {
    document.getElementById('home-hunt-btn')?.addEventListener('click', () => {
        console.log('🎯 Hunt button clicked!');
        console.log('Current screen before:', document.querySelector('.screen.active')?.id);
        showScreen('ar-screen');
        console.log('Current screen after:', document.querySelector('.screen.active')?.id);
    });
}

// Render the user's character in the profile circle
function renderProfileAvatar() {
    console.log('🎨 Rendering profile avatar');
    
    const profileCircle = document.querySelector('.home-profile-circle');
    
    if (!profileCircle) {
        console.log('❌ No profile circle found!');
        return;
    }
    
    // Get current user data
    const userData = getCurrentUserData();
    
    if (!userData || !userData.guardian) {
        console.log('⚠️ No user data or guardian found');
        return;
    }
    
    const guardian = userData.guardian;
    console.log('✅ Rendering avatar for guardian:', guardian);
    
    // Clear existing content
    profileCircle.innerHTML = '';
    
    // Create image layers based on style
    if (guardian.style === 'style3') {
        // Style 3 (Tornado): Body → Accessory → Eyes
        const bodyImg = document.createElement('img');
        bodyImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.color}.png`;
        bodyImg.className = 'home-avatar-layer';
        profileCircle.appendChild(bodyImg);
        
        if (guardian.accessory) {
            const accessoryImg = document.createElement('img');
            accessoryImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.accessory}.png`;
            accessoryImg.className = 'home-avatar-layer';
            profileCircle.appendChild(accessoryImg);
        }
        
        const eyesImg = document.createElement('img');
        eyesImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.eyes}.png`;
        eyesImg.className = 'home-avatar-layer';
        profileCircle.appendChild(eyesImg);
    } else {
        // Style 1 & 2: Body → Eyes → Accessory
        const bodyImg = document.createElement('img');
        bodyImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.color}.png`;
        bodyImg.className = 'home-avatar-layer';
        profileCircle.appendChild(bodyImg);
        
        const eyesImg = document.createElement('img');
        eyesImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.eyes}.png`;
        eyesImg.className = 'home-avatar-layer';
        profileCircle.appendChild(eyesImg);
        
        if (guardian.accessory) {
            const accessoryImg = document.createElement('img');
            accessoryImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.accessory}.png`;
            accessoryImg.className = 'home-avatar-layer';
            profileCircle.appendChild(accessoryImg);
        }
    }
    
    console.log('✅ Profile avatar rendered!');
}

// Setup click handler for profile circle
function setupProfileClick() {
    const profileCircle = document.querySelector('.home-profile-circle');
    
    if (profileCircle) {
        profileCircle.addEventListener('click', () => {
            console.log('👤 Profile clicked - going to user window');
            showScreen('user-window-screen');
        });
    }
}

function updateCollection() {
    const data = JSON.parse(localStorage.getItem('airMonsters'));
    const username = data?.currentUser;
    if (!username) return;

    const catches = data.users[username]?.catches || { totalCatches: 0, unlockedMonsters: [] };

    const countEl = document.getElementById('monster-count');
    if (countEl) countEl.textContent = catches.totalCatches;

    catches.unlockedMonsters.forEach(monsterType => {
        const card = document.querySelector(`.monster-card[data-monster="${monsterType}"] .monster-cover-card`);
        if (card) card.classList.add('unlocked');
    });
}

// Watch for home screen becoming active
const homeScreen = document.getElementById('home-screen');
if (homeScreen) {
    const observer = new MutationObserver(() => {
        if (homeScreen.classList.contains('active')) {
            renderProfileAvatar();
            setupProfileClick();
            setupHuntButtons();
            updateCollection();
        }
    });
    observer.observe(homeScreen, { attributes: true, attributeFilter: ['class'] });
}
