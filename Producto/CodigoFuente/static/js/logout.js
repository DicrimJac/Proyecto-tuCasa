/**
 * Logout functionality for Tu Casa platform
 */

// DOM Elements
const initialState = document.getElementById('initialState');
const loadingState = document.getElementById('loadingState');
const successState = document.getElementById('successState');
const cancelBtn = document.getElementById('cancelLogout');
const confirmBtn = document.getElementById('confirmLogout');

// Configuration
const config = {
    logoutDelay: 1500,
    redirectDelay: 2000,
    redirectUrl: 'login.html',
    profileUrl: 'profile.html' 
};

/**
 * Clears all session data
 */
function clearSessionData() {
    try {
        localStorage.clear();
        sessionStorage.clear();
        
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        console.log('Session data cleared');
    } catch (error) {
        console.error('Error clearing session:', error);
    }
}

function showLoadingState() {
    if (initialState) initialState.style.display = 'none';
    if (loadingState) loadingState.style.display = 'block';
    if (successState) successState.style.display = 'none';
}

function showSuccessState() {
    if (loadingState) loadingState.style.display = 'none';
    if (successState) successState.style.display = 'block';
}

function performLogout() {
    showLoadingState();
    
    setTimeout(() => {
        clearSessionData();
        showSuccessState();
        
        setTimeout(() => {
            window.location.href = config.redirectUrl;
        }, config.redirectDelay);
    }, config.logoutDelay);
}

// Cancelar: Redirigir al perfil del usuario
function cancelLogout() {
    window.location.href = config.profileUrl;
}

function initEventListeners() {
    if (cancelBtn) cancelBtn.addEventListener('click', cancelLogout);
    if (confirmBtn) confirmBtn.addEventListener('click', performLogout);
}

function preventBackNavigation() {
    history.pushState(null, null, location.href);
    window.onpopstate = function() {
        history.go(1);
    };
}

function init() {
    if (!initialState || !loadingState || !successState) {
        console.error('Required DOM elements not found');
        return;
    }
    
    initEventListeners();
    preventBackNavigation();
    console.log('Logout page initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}