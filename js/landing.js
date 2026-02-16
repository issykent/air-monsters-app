/* Landing & Login Screen Logic */

import { showScreen } from './app.js';
import { state } from './config.js';

function initLanding() {
    console.log('Landing initialized');
    setupLandingButtons();
    setupLoginForm();
}

// Setup landing screen buttons
function setupLandingButtons() {
    const createAccountBtn = document.getElementById('create-account-button');
    const loginBtn = document.getElementById('login-button');
    
    console.log('🔵 Create account button found:', !!createAccountBtn);
    console.log('🔵 Login button found:', !!loginBtn);
    console.log('🔵 Create account button element:', createAccountBtn);
    
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            console.log('Create account clicked');
            
            // Set context so customiser knows this is a new account
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
    const loginSubmitBtn = document.getElementById('login-submit-button');
    const passwordCircles = document.querySelectorAll('.password-circle');
    
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
            const username = document.querySelector('.username-input').value;
            const password = Array.from(passwordCircles).map(c => c.value).join('');
            
            console.log('Login attempt:', username, password);
            alert('Login functionality coming soon! For now, click "Create an account" to build your character.');
        });
    }
}

// Initialize when ready
initLanding();