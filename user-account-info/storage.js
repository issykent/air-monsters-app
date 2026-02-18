/* localStorage Management */

const STORAGE_KEY = 'airMonsters';

// Initialize storage structure if it doesn't exist
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const initialData = {
            users: {},
            currentUser: null
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
}

// Get all data from storage
function getData() {
    initStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

// Save all data to storage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Save a user
export function saveUser(username, userData) {
    const data = getData();
    data.users[username] = {
        ...userData,
        createdAt: new Date().toISOString()
    };
    saveData(data);
    console.log('💾 User saved:', username);
}

// Get a specific user
export function getUser(username) {
    const data = getData();
    return data.users[username] || null;
}

// Get all users
export function getAllUsers() {
    const data = getData();
    return data.users;
}

// Check if username exists
export function userExists(username) {
    const data = getData();
    return username in data.users;
}

// Set current logged-in user
export function setCurrentUser(username) {
    const data = getData();
    data.currentUser = username;
    saveData(data);
    console.log('👤 Current user set:', username);
}

// Get current logged-in user
export function getCurrentUser() {
    const data = getData();
    return data.currentUser;
}

// Clear current user (logout)
export function clearCurrentUser() {
    const data = getData();
    data.currentUser = null;
    saveData(data);
    console.log('👋 User logged out');
}

// Get current user's full data
export function getCurrentUserData() {
    const username = getCurrentUser();
    if (!username) return null;
    return getUser(username);
}