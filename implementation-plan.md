# Implementation Plan: Total Sum Display and Cookie-Based Session Storage

## Overview

This document outlines the implementation plan for two features in the CoWorking Mietenberechnung application:

1. Adding a prominent total sum display at the top of the results area
2. Implementing cookie-based session storage while maintaining JSON export/import functionality

## 1. Prominent Total Sum Display

### Current State
- The total sum (calculatedTotalRentSum) is calculated in calculation.js
- It's currently displayed as a checksum at the bottom of the results table
- We need a new, more prominent display at the top of the results area

### Implementation Plan

#### 1.1 HTML Modifications
We'll add a new prominent display element at the top of the results area in index.html:

```html
<div id="results" style="display: none;">
    <div id="totalSumDisplay" class="total-sum-display">
        <h3>Gesamtmiete: <span id="prominentTotalSum">0.00</span> €</h3>
    </div>
    <div id="calculationSummary"></div>
    <!-- Rest of the existing results content -->
</div>
```

#### 1.2 Add CSS Styling
Add styling for the new total sum display in styles.css:

```css
.total-sum-display {
    background-color: #f5f5f5;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 5px;
    text-align: center;
    border-left: 5px solid #26a69a;
}

.total-sum-display h3 {
    margin: 0;
    color: #26a69a;
}

#prominentTotalSum {
    font-weight: bold;
    font-size: 1.2em;
}
```

#### 1.3 Update renderResults in ui.js
Modify the renderResults function to update the new total sum display:

```javascript
export function renderResults(calculatedData) {
    // Existing code...
    
    // Update the prominent total sum display
    const prominentTotalSum = document.getElementById('prominentTotalSum');
    if (prominentTotalSum) {
        prominentTotalSum.textContent = calculatedData.calculatedTotalRentSum.toFixed(2);
    }
    
    // Rest of existing code...
}
```

## 2. Cookie-Based Session Storage

### Current State
- Data persistence relies on manual export/import of JSON files
- No automatic saving during the session
- The application tracks data changes with dataChanged flag

### Implementation Plan

#### 2.1 Create cookie.js Module
Create a new file scripts/cookie.js:

```javascript
import { data, setData, markDataAsSaved } from './data.js';
import { renderRoomList, renderTenantList, populateTenantSelect, totalColdRentInput, utilitiesInput, initializeMaterializeSelects, showMessage } from './ui.js';
import { calculateRent } from './calculation.js';
import { MESSAGES } from './constants.js';

// Constants
const COOKIE_NAME = 'coworking_session_data';
const SESSION_EXPIRY_HOURS = 24; // Session data expires after 24 hours

/**
 * Saves the current application data to a session cookie.
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
 * Loads application data from session storage.
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
 * Clears session storage data.
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
```

#### 2.2 Update constants.js
Add new messages for cookie operations:

```javascript
export const MESSAGES = {
    // Existing messages...
    
    // Add new cookie-related messages
    SESSION_SAVE_SUCCESS: 'Daten erfolgreich in Session gespeichert.',
    SESSION_LOAD_SUCCESS: 'Daten erfolgreich aus Session geladen.',
    SESSION_LOAD_ERROR: 'Fehler beim Laden der Sessiondaten.',
    SESSION_CLEAR_SUCCESS: 'Sessiondaten erfolgreich gelöscht.'
};
```

#### 2.3 Modify data.js
Update the markDataAsChanged function to save to session storage:

```javascript
import { saveToSessionStorage } from './cookie.js';

export function markDataAsChanged() {
    dataChanged = true;
    
    // Save to session storage whenever data changes
    saveToSessionStorage();
}
```

#### 2.4 Update app.js
Modify the DOMContentLoaded event to load from session storage:

```javascript
import { loadFromSessionStorage, updateSessionStatusDisplay, clearSessionStorage } from './cookie.js';

document.addEventListener('DOMContentLoaded', () => {
    // Try to load data from session storage
    const dataLoaded = loadFromSessionStorage();
    
    if (!dataLoaded) {
        // If no session data, initialize with empty data
        renderRoomList();
        renderTenantList();
        populateTenantSelect();
    }
    
    // Update session status display
    updateSessionStatusDisplay();
    
    // Add event listener for clear session button
    const clearSessionBtn = document.getElementById('clearSessionBtn');
    if (clearSessionBtn) {
        clearSessionBtn.addEventListener('click', () => {
            clearSessionStorage();
            showMessage(MESSAGES.SESSION_CLEAR_SUCCESS, 'info');
        });
    }
    
    // Rest of existing code...
});
```

#### 2.5 Update io.js
Modify the importData function to save to session storage after import:

```javascript
import { saveToSessionStorage } from './cookie.js';

export function importData(event) {
    // Existing code...
    
    // Inside the successful import block
    try {
        // Existing import code...
        
        setData(importedData);
        
        // Update UI
        // Existing UI update code...
        
        // Save imported data to session storage
        saveToSessionStorage();
        
        showMessage(MESSAGES.FILE_IMPORT_SUCCESS, 'info');
    } catch (error) {
        // Existing error handling...
    }
}
```

#### 2.6 Update index.html
Add UI elements for session storage management:

```html
<div class="nav-wrapper">
    <a href="#" class="brand-logo"><i class="material-icons">business</i>CoWorking Mietenberechnung</a>
    <ul id="nav-mobile" class="right hide-on-med-and-down">
        <li><span id="sessionStatusDisplay" class="session-status"></span></li>
        <li><a href="#!" id="clearSessionBtn" class="btn-small waves-effect waves-light red"><i class="material-icons left">delete</i>Session löschen</a></li>
        <li><a href="#!" id="exportDataBtn" class="btn waves-effect waves-light"><i class="material-icons left">file_download</i>Daten exportieren</a></li>
        <li>
            <button class="btn waves-effect waves-light" id="importDataBtn"><i class="material-icons left">file_upload</i>Daten importieren</button>
            <input type="file" id="importFile" accept=".json" style="display: none;">
        </li>
    </ul>
</div>
```

#### 2.7 Add CSS for Session Status
Add styling for the session status display in styles.css:

```css
.session-status {
    color: #e0f2f1;
    font-size: 0.9rem;
    padding: 0 10px;
}
```

## Implementation Strategy

### Phase 1: Prominent Total Sum Display
1. Modify index.html to add the new total sum display element
2. Add CSS styling for the new display
3. Update the renderResults function in ui.js

### Phase 2: Cookie-Based Session Storage
1. Create the cookie.js module with core functions
2. Update constants.js with new messages
3. Modify data.js to save to session storage on changes
4. Update app.js to load from session storage on page load
5. Modify io.js to save to session storage after import
6. Update index.html with session storage UI elements
7. Add CSS styling for session status display

### Phase 3: Testing and Refinement
1. Test the prominent total sum display
2. Test session storage with various data sizes
3. Verify data integrity across page reloads
4. Test compatibility with existing import/export functionality

## Considerations and Limitations

### Cookie Size Limitations
- Cookies are limited to ~4KB
- The implementation uses localStorage as a fallback for larger datasets
- Session data expires after 24 hours to prevent stale data

### User Experience
- Session status display shows when data was last saved
- Clear session button allows users to start fresh
- Automatic saving happens whenever data changes

### Data Integrity
- Validation is performed when loading from session storage
- Compatibility with file import/export is maintained
- Error handling is implemented for all operations