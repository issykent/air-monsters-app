/* Landing & Login Screen Logic */

import { showScreen } from './app.js';
import { state } from './config.js';
import { login, createAccount } from '../user-account-info/auth.js';

function initLanding() {
    console.log('Landing initialized');
    setupLandingButtons();
    setupLoginForm();
    setupCreateAccountForm();
    monitorCreateAccountScreen();
}

// Monitor when create-account-info-screen becomes visible
function monitorCreateAccountScreen() {
    const screen = document.getElementById('create-account-info-screen');
    if (!screen) return;
    
    const observer = new MutationObserver(() => {
        if (screen.classList.contains('active')) {
            console.log('🎨 Create account screen is now active!');
            renderAvatar();
        }
    });
    
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}

// Setup landing screen buttons
function setupLandingButtons() {
    const createAccountBtn = document.getElementById('create-account-button');
    const loginBtn = document.getElementById('login-button');
    
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            console.log('Create account clicked');
            state.customiserContext = 'new-account';
            
            if (window.startLoading) {
                window.startLoading('customiser-screen');
            } else {
                showScreen('customiser-screen');
            }
        });
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
            
            console.log('🔐 Login attempt:', username);
            
            // Attempt login
            const result = login(username, password);
            
            if (result.success) {
                console.log('✅ Login successful!');
                // Go to home screen via loading
                if (window.startLoading) {
                    window.startLoading('home-screen');
                } else {
                    showScreen('home-screen');
                }
            } else {
                console.log('❌ Login failed:', result.error);
                alert(result.error);  // TODO: Replace with custom popup later
            }
        });
    }
}

// Setup create account form
function setupCreateAccountForm() {
    console.log('🔧 setupCreateAccountForm() called');
    
    const createAccountBtn = document.querySelector('.create-account-button');
    const passwordDigits = document.querySelectorAll('#create-account-info-screen .password-digit');
    
    console.log('🔧 Create account button found:', !!createAccountBtn);
    console.log('🔧 Password digits found:', passwordDigits.length);
    
    // Auto-advance between password digits
    passwordDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            if (e.target.value && index < passwordDigits.length - 1) {
                passwordDigits[index + 1].focus();
            }
        });
        
        digit.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                passwordDigits[index - 1].focus();
            }
        });
    });
    
    if (createAccountBtn) {
        console.log('🔧 Adding click listener to create account button');
        
        createAccountBtn.addEventListener('click', () => {
            console.log('🎯 CREATE ACCOUNT BUTTON CLICKED!'); // <-- ADD THIS
            
            const username = document.querySelector('#create-account-info-screen .username-input').value;
            const password = Array.from(passwordDigits).map(d => d.value).join('');
            
            console.log('🎯 Username:', username); // <-- ADD THIS
            console.log('🎯 Password:', password); // <-- ADD THIS
            console.log('🎯 Guardian:', state.selectedGuardian); // <-- ADD THIS
            
            // Get guardian data from state
            if (!state.selectedGuardian) {
                console.log('❌ No guardian selected!');
                alert('Error: No character selected!');
                return;
            }
            
            // Attempt to create account
            const result = createAccount(username, password, state.selectedGuardian);
            
            console.log('🎯 Create account result:', result); // <-- ADD THIS
            
            if (result.success) {
                console.log('✅ Account created successfully!');
                // Go to home screen via loading
                if (window.startLoading) {
                    window.startLoading('home-screen');
                } else {
                    showScreen('home-screen');
                }
            } else {
                console.log('❌ Account creation failed:', result.error);
                alert(result.error);
            }
        });
        
        console.log('🔧 Click listener added!');
    }
}

// Render the character avatar in the profile circle
function renderAvatar() {
    console.log('🎨 renderAvatar() called');
    const avatarCircle = document.querySelector('.avatar-circle');
    
    if (!avatarCircle) {
        console.log('❌ No avatar circle found!');
        return;
    }
    
    if (!state.selectedGuardian) {
        console.log('⚠️ No selected guardian yet');
        return;
    }
    
    const guardian = state.selectedGuardian;
    console.log('✅ Rendering avatar for:', guardian);
    
    avatarCircle.innerHTML = '';
    
    if (guardian.style === 'style3') {
        const bodyImg = document.createElement('img');
        bodyImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.color}.png`;
        bodyImg.className = 'avatar-layer';
        avatarCircle.appendChild(bodyImg);
        
        if (guardian.accessory) {
            const accessoryImg = document.createElement('img');
            accessoryImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.accessory}.png`;
            accessoryImg.className = 'avatar-layer';
            avatarCircle.appendChild(accessoryImg);
        }
        
        const eyesImg = document.createElement('img');
        eyesImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.eyes}.png`;
        eyesImg.className = 'avatar-layer';
        avatarCircle.appendChild(eyesImg);
    } else {
        const bodyImg = document.createElement('img');
        bodyImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.color}.png`;
        bodyImg.className = 'avatar-layer';
        avatarCircle.appendChild(bodyImg);
        
        const eyesImg = document.createElement('img');
        eyesImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.eyes}.png`;
        eyesImg.className = 'avatar-layer';
        avatarCircle.appendChild(eyesImg);
        
        if (guardian.accessory) {
            const accessoryImg = document.createElement('img');
            accessoryImg.src = `css/images/${guardian.style}/${guardian.style}-${guardian.accessory}.png`;
            accessoryImg.className = 'avatar-layer';
            avatarCircle.appendChild(accessoryImg);
        }
    }
}

initLanding();