import { data, setData, markDataAsSaved } from './data.js';
import { renderRoomList, renderTenantList, populateTenantSelect, totalColdRentInput, utilitiesInput, initializeMaterializeSelects, showMessage } from './ui.js';
import { calculateRent } from './calculation.js';
import { MESSAGES } from './constants.js';

// Constants
const COOKIE_NAME = 'coworking_session_data';
const SESSION_EXPIRY_HOURS = 24; // Session data expires after 24 hours

/**
 * Saves the current application data to session storage (localStorage or cookie).
 * Uses localStorage for larger data, cookie for smaller data.
 * @returns {boolean} True if saving was successful, false otherwise.
 */
export function saveToSessionStorage() {
    try {
        const serializedData = JSON.stringify(data);

        // Check if the data is too large for a cookie (max ~4KB)
        if (serializedData.length > 4000) {
            // Use localStorage instead for larger data
            localStorage.setItem(COOKIE_NAME, serializedData);
        } else {
            // Use cookie for smaller data
            setCookie(COOKIE_NAME, btoa(serializedData), SESSION_EXPIRY_HOURS / 24);
            localStorage.removeItem(COOKIE_NAME); // Remove from localStorage if saved to cookie
        }

        // Update last saved timestamp
        const timestamp = new Date().toLocaleString();
        localStorage.setItem(`${COOKIE_NAME}_timestamp`, timestamp);

        updateSessionStatusDisplay();
        return true;
    } catch (error) {
        console.error('Error saving data to session:', error);
        return false;
    }
}

/**
 * Loads application data from session storage (localStorage or cookie).
 * Tries localStorage first, then cookie.
 * @returns {boolean} True if loading was successful, false otherwise.
 */
export function loadFromSessionStorage() {
    try {
        let serializedData;

        // Try localStorage first
        serializedData = localStorage.getItem(COOKIE_NAME);

        // If not in localStorage, try cookie
        if (!serializedData) {
            const cookieData = getCookie(COOKIE_NAME);
            if (cookieData) {
                serializedData = atob(cookieData);
            }
        }

        if (!serializedData) {
            return false;
        }

        const loadedData = JSON.parse(serializedData);

        // Validate data structure
        if (!isValidData(loadedData)) {
            console.error('Invalid data structure loaded from session storage.');
            return false;
        }

        setData(loadedData);

        // Update UI
        totalColdRentInput.value = loadedData.totalColdRent || 0;
        utilitiesInput.value = loadedData.utilities || 0;
        renderRoomList();
        renderTenantList();
        populateTenantSelect();
        initializeMaterializeSelects();
        calculateRent();

        updateSessionStatusDisplay();
        markDataAsSaved(); // Mark as saved since we just loaded it

        return true;
    } catch (error) {
        console.error('Error loading data from session:', error);
        return false;
    }
}

/**
 * Clears session storage data (localStorage and cookie).
 */
export function clearSessionStorage() {
    localStorage.removeItem(COOKIE_NAME);
    localStorage.removeItem(`${COOKIE_NAME}_timestamp`);
    deleteCookie(COOKIE_NAME);
    updateSessionStatusDisplay();
}

/**
 * Updates the session status display in the UI.
 */
export function updateSessionStatusDisplay() {
    const statusElement = document.getElementById('sessionStatusDisplay');
    if (!statusElement) return;

    const timestamp = localStorage.getItem(`${COOKIE_NAME}_timestamp`);

    if (timestamp) {
        statusElement.textContent = `Letzte Speicherung: ${timestamp}`;
        statusElement.style.display = 'block';
    } else {
        statusElement.style.display = 'none';
    }
}

// Helper functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
}

function isValidData(data) {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.totalColdRent === 'number' &&
        Array.isArray(data.rooms) &&
        Array.isArray(data.tenants)
    );
}