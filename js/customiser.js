/* Character Customiser Logic */

import { showScreen } from './app.js';
import { state } from './config.js';

// State for each style (each has independent customization)
const styleStates = {
    style1: {
        color: 'white',
        eyes: 'eyes1',
        accessory: null,
        characterName: ''
    },
    style2: {
        color: 'white',
        eyes: 'eyes1',
        accessory: null,
        characterName: ''
    },
    style3: {
        color: 'white',
        eyes: 'eyes1',
        accessory: null,
        characterName: ''
    }
};

// Currently active style
let activeStyle = 'style1';

// Color mapping (matches grid order)
const colorMap = [
    'black', 'purple', 'pink', 'cyan', 'blue',     // Top row
    'red', 'yellow', 'mint', 'green', 'white'      // Bottom row
];

// Accessory mapping
const accessoryMap = [1, 3, 5, 2, 4, 6];

// Initialize
function initCustomiser() {
    console.log('Customiser initialized');
    setupCarousel();
    setupColorButtons();
    setupEyeButtons();
    setupAccessoryButtons();
    setupNamePreview();
    setupSaveButton();
}

// Setup carousel scroll detection
function setupCarousel() {
    const carousel = document.querySelector('.character-carousel');
    const previews = document.querySelectorAll('.character-preview');
    
    if (!carousel) return;
    
    // Center style1 on load
    carousel.scrollLeft = 0;
    updateActiveStyle();
    
    // Detect scroll and update active style
    carousel.addEventListener('scroll', () => {
        updateActiveStyle();
    });
    
    // Update initially
    updateActiveStyle();
}

// Detect which character is centered and mark as active
function updateActiveStyle() {
    const carousel = document.querySelector('.character-carousel');
    const previews = document.querySelectorAll('.character-preview');
    
    if (!carousel || !previews.length) return;
    
    const carouselCenter = carousel.scrollLeft + (carousel.offsetWidth / 2);
    
    let closestPreview = null;
    let closestDistance = Infinity;
    
    previews.forEach(preview => {
        const previewCenter = preview.offsetLeft + (preview.offsetWidth / 2);
        const distance = Math.abs(carouselCenter - previewCenter);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPreview = preview;
        }
    });
    
    // Update active class
    previews.forEach(p => p.classList.remove('active'));
    if (closestPreview) {
        closestPreview.classList.add('active');
        activeStyle = closestPreview.getAttribute('data-style');
        console.log('Active style:', activeStyle);
        
        // Update selection indicators to match active style
        updateSelectionIndicators();
    }
}

// Update selection indicators to match active style's state
function updateSelectionIndicators() {
    const state = styleStates[activeStyle];
    
    // Update color circles
    const colorCircles = document.querySelectorAll('.colour-circle');
    colorCircles.forEach((circle, index) => {
        if (colorMap[index] === state.color) {
            circle.classList.add('selected');
        } else {
            circle.classList.remove('selected');
        }
    });
    
    // Update eye options
    const eyeOptions = document.querySelectorAll('.eye-option');
    eyeOptions.forEach((option, index) => {
        if (`eyes${index + 1}` === state.eyes) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // Update accessory options
    const accessoryOptions = document.querySelectorAll('.accessory-option');
    accessoryOptions.forEach((option, index) => {
        if (state.accessory === `accessory${accessoryMap[index]}`) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Setup color circle buttons
function setupColorButtons() {
    const colorCircles = document.querySelectorAll('.colour-circle');
    
    colorCircles.forEach((circle, index) => {
        circle.addEventListener('click', () => {
            const colorName = colorMap[index];
            const state = styleStates[activeStyle];
            
            // Toggle selection
            if (state.color === colorName) {
                // Deselect - reset to white
                state.color = 'white';
            } else {
                // Select new color
                state.color = colorName;
            }
            
            updatePreview();
            updateSelectionIndicators();
        });
    });
}

// Setup eye option buttons
function setupEyeButtons() {
    const eyeOptions = document.querySelectorAll('.eye-option');
    
    eyeOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            const eyeNumber = `eyes${index + 1}`;
            const state = styleStates[activeStyle];
            
            // Toggle selection
            if (state.eyes === eyeNumber) {
                // Deselect - reset to eyes1
                state.eyes = 'eyes1';
            } else {
                // Select new eyes
                state.eyes = eyeNumber;
            }
            
            updatePreview();
            updateSelectionIndicators();
        });
    });
}

// Setup accessory buttons
function setupAccessoryButtons() {
    const accessoryOptions = document.querySelectorAll('.accessory-option');
    
    accessoryOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            const accessoryNumber = `accessory${accessoryMap[index]}`;
            const state = styleStates[activeStyle];
            
            // Toggle selection
            if (state.accessory === accessoryNumber) {
                // Deselect - remove accessory
                state.accessory = null;
            } else {
                // Select new accessory
                state.accessory = accessoryNumber;
            }
            
            updatePreview();
            updateSelectionIndicators();
        });
    });
}

// Setup name input live preview with dynamic font sizing
function setupNamePreview() {
    const nameInput = document.querySelector('.name-input');
    const titleImage = document.getElementById('title-image');
    const nameDisplay = document.getElementById('character-name-display');
    
    if (nameInput && titleImage && nameDisplay) {
        nameInput.addEventListener('input', (e) => {
            const name = e.target.value.trim();
            
            if (name.length > 0) {
                // Show typed name, hide image
                nameDisplay.textContent = name;
                nameDisplay.style.display = 'block';
                titleImage.style.display = 'none';
                
                // Adjust font size dynamically to fit within 80vw
                adjustFontSize(nameDisplay);
            } else {
                // Show image, hide name
                nameDisplay.style.display = 'none';
                titleImage.style.display = 'block';
            }
            
            // Update state for active style
            styleStates[activeStyle].characterName = name;
        });
    }
}

// Adjust font size to fit within max width
function adjustFontSize(element) {
    const maxWidth = window.innerWidth * 0.8;
    let fontSize = 30;
    
    element.style.fontSize = fontSize + 'pt';
    
    while (element.scrollWidth > maxWidth && fontSize > 12) {
        fontSize -= 1;
        element.style.fontSize = fontSize + 'pt';
    }
}

// Update character preview for active style only
function updatePreview() {
    const activePreview = document.querySelector(`.character-preview[data-style="${activeStyle}"]`);
    if (!activePreview) return;
    
    const state = styleStates[activeStyle];
    
    const bodyImg = activePreview.querySelector('.character-body');
    const eyesImg = activePreview.querySelector('.character-eyes');
    const accessoryImg = activePreview.querySelector('.character-accessory');
    
    // Update body color
    bodyImg.src = `css/images/${activeStyle}/${activeStyle}-${state.color}.png`;
    
    // Update eyes
    eyesImg.src = `css/images/${activeStyle}/${activeStyle}-${state.eyes}.png`;
    
    // Update accessory
    if (state.accessory) {
        accessoryImg.src = `css/images/${activeStyle}/${activeStyle}-${state.accessory}.png`;
        accessoryImg.style.display = 'block';
    } else {
        accessoryImg.style.display = 'none';
    }
    
    console.log(`${activeStyle} updated:`, state);
}

// Setup save button
function setupSaveButton() {
    const saveButton = document.querySelector('.save-button');
    
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            console.log('Save button clicked');
            console.log('Current context:', state.customiserContext);
            
            // Check context to determine where to go
            if (state.customiserContext === 'new-account') {
                console.log('New account flow - going to create account info screen');
                
                // Save character data to state (we'll do this properly later)
                // For now just navigate
                
                if (window.startLoading) {
                    window.startLoading('create-account-info-screen');
                } else {
                    showScreen('create-account-info-screen');
                }
            } else if (state.customiserContext === 'editing') {
                console.log('Editing flow - going back to user area');
                // TODO: Implement later
                showScreen('user-window-screen');
            } else {
                console.log('No context set - defaulting to home screen');
                showScreen('home-screen');
            }
        });
    }
}

// Initialize when ready
initCustomiser();