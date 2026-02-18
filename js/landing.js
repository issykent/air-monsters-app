/* Landing & Login Screen Logic */

import { showScreen } from './app.js';
import { state } from './config.js';

function initLanding() {
    console.log('Landing initialized');
    setupLandingButtons();
    setupLoginForm();
    monitorCreateAccountScreen();  // Changed from renderAvatar()
}

// Monitor when create-account-info-screen becomes visible
function monitorCreateAccountScreen() {
    const observer = new MutationObserver(() => {
        const screen = document.getElementById('create-account-info-screen');
        if (screen && screen.classList.contains('active')) {
            console.log('🎨 Create account screen is now active!');
            renderAvatar();
        }
    });
    
    // Watch for class changes on all screens
    document.querySelectorAll('.screen').forEach(screen => {
        observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
    });
}

// Setup landing screen buttons
function setupLandingButtons() {
    const createAccountBtn = document.getElementById('create-account-button');
    const loginBtn = document.getElementById('login-button');
    
    console.log('🔵 Create account button found:', !!createAccountBtn);
    console.log('🔵 Login button found:', !!loginBtn);
    
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            console.log('Create account clicked');
            
            state.customiserContext = 'new-account';
            console.log('Context set to: new-account');
            
            if (window.startLoading) {
                window.startLoading('customiser-screen');
            } else {
                showScreen('customiser-screen');
            }
        });
        console.log('🔵 Event listener added to create account button');
    } else {
        console.log('🔴 ERROR: Create account button NOT FOUND!');
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('Login clicked');
            showScreen('login-form-screen');
        });
    }
}

// Setup login form
function setupLoginForm() {
    const loginSubmitBtn = document.querySelector('.login-submit-button');
    const passwordCircles = document.querySelectorAll('.login-password-digit');
    
    // Auto-focus next circle when digit entered
    passwordCircles.forEach((circle, index) => {
        circle.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            if (e.target.value && index < passwordCircles.length - 1) {
                passwordCircles[index + 1].focus();
            }
        });
        
        circle.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                passwordCircles[index - 1].focus();
            }
        });
    });
    
    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', () => {
            const username = document.querySelector('.login-username-input').value;
            const password = Array.from(passwordCircles).map(c => c.value).join('');
            
            console.log('Login attempt:', username, password);
            alert('Login functionality coming soon! For now, click "Create an account" to build your character.');
        });
    }
}

// Render the character avatar in the profile circle
function renderAvatar() {
    console.log('🎨 renderAvatar() called');
    console.log('🎨 state.selectedGuardian:', state.selectedGuardian);
    
    const avatarCircle = document.querySelector('.avatar-circle');
    console.log('🎨 Avatar circle element:', avatarCircle);
    
    if (!avatarCircle) {
        console.log('❌ No avatar circle found!');
        return;
    }
    
    if (!state.selectedGuardian) {
        console.log('⚠️ No selected guardian yet - circle will stay white');
        return;
    }
    
    const guardian = state.selectedGuardian;
    console.log('✅ Rendering avatar for:', guardian);
    
    // Clear existing content
    avatarCircle.innerHTML = '';
    
    // Create image layers based on style
    if (guardian.style === 'style3') {
        // Style 3 (Tornado): Body → Accessory → Eyes
        const bodyImg = document.createElement('img');
        bodyImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.color}.png`;
        bodyImg.className = 'avatar-layer';
        console.log('🎨 Adding body:', bodyImg.src);
        avatarCircle.appendChild(bodyImg);
        
        if (guardian.accessory) {
            const accessoryImg = document.createElement('img');
            accessoryImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.accessory}.png`;
            accessoryImg.className = 'avatar-layer';
            console.log('🎨 Adding accessory:', accessoryImg.src);
            avatarCircle.appendChild(accessoryImg);
        }
        
        const eyesImg = document.createElement('img');
        eyesImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.eyes}.png`;
        eyesImg.className = 'avatar-layer';
        console.log('🎨 Adding eyes:', eyesImg.src);
        avatarCircle.appendChild(eyesImg);
    } else {
        // Style 1 & 2: Body → Eyes → Accessory
        const bodyImg = document.createElement('img');
        bodyImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.color}.png`;
        bodyImg.className = 'avatar-layer';
        console.log('🎨 Adding body:', bodyImg.src);
        avatarCircle.appendChild(bodyImg);
        
        const eyesImg = document.createElement('img');
        eyesImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.eyes}.png`;
        eyesImg.className = 'avatar-layer';
        console.log('🎨 Adding eyes:', eyesImg.src);
        avatarCircle.appendChild(eyesImg);
        
        if (guardian.accessory) {
            const accessoryImg = document.createElement('img');
            accessoryImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.accessory}.png`;
            accessoryImg.className = 'avatar-layer';
            console.log('🎨 Adding accessory:', accessoryImg.src);
            avatarCircle.appendChild(accessoryImg);
        }
    }
    
    console.log('✅ Avatar rendered! Circle children:', avatarCircle.children.length);
}

// Initialize when ready
initLanding();