/* Authentication Logic */

import { saveUser, getUser, userExists, setCurrentUser, clearCurrentUser, getCurrentUser } from './storage.js';

// Create a new account
export function createAccount(username, password, guardianData) {
    console.log('🔐 Creating account for:', username);
    
    // Validate username
    if (!username || username.trim() === '') {
        return { success: false, error: 'Username cannot be empty' };
    }
    
    // Check if username already exists
    if (userExists(username)) {
        return { success: false, error: 'Username already exists' };
    }
    
    // Validate password (must be 4 digits)
    if (!password || password.length !== 4) {
        return { success: false, error: 'Password must be 4 digits' };
    }
    
    // Create user data
    const userData = {
        password: password,
        guardian: guardianData,
        collection: []
    };
    
    // Save user
    saveUser(username, userData);
    
    // Log them in
    setCurrentUser(username);
    
    console.log('✅ Account created successfully');
    return { success: true };
}

// Login
export function login(username, password) {
    console.log('🔐 Login attempt for:', username);
    
    // Check if user exists
    if (!userExists(username)) {
        return { success: false, error: 'Invalid username or password' };
    }
    
    // Get user data
    const userData = getUser(username);
    
    // Validate password
    if (userData.password !== password) {
        return { success: false, error: 'Invalid username or password' };
    }
    
    // Log them in
    setCurrentUser(username);
    
    console.log('✅ Login successful');
    return { success: true, userData: userData };
}

// Logout
export function logout() {
    console.log('👋 Logging out');
    clearCurrentUser();
    
    // Reload to landing screen
    window.location.reload();
}

// Check if user is logged in
export function isLoggedIn() {
    const currentUser = getCurrentUser();
    return currentUser !== null;
}