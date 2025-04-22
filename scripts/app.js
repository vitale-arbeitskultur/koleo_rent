import { renderRoomList, renderTenantList, populateTenantSelect, totalColdRentInput, utilitiesInput, roomNameInput, roomAreaInput, roomTenantSelect, isCommonAreaCheckbox, importFileInput, importDataBtn, initializeMaterializeSelects, showSaveWarningModal, exportBeforeCloseBtn, closeWithoutSavingBtn } from './ui.js'; // Import modal functions and buttons
import { addTenant } from './tenants.js';
import { addRoom, saveRoom, cancelEdit } from './rooms.js';
import { calculateRent } from './calculation.js';
import { exportData, importData } from './io.js';
import { dataChanged, markDataAsChanged, markDataAsSaved } from './data.js'; // Import dataChanged, markDataAsChanged, and markDataAsSaved

// --- Event Listeners ---
/**
 * Initializes the application when the DOM is fully loaded.
 * Sets up initial rendering, attaches event listeners, and initializes Materialize components.
 */
document.addEventListener('DOMContentLoaded', () => {
    renderRoomList(); // Initial empty list display
    renderTenantList(); // Initial empty tenant list display
    populateTenantSelect(); // Initial empty dropdown population

    // Attach event listeners to buttons and inputs
    document.getElementById('addRoomBtn').addEventListener('click', addRoom);
    document.getElementById('saveRoomBtn').addEventListener('click', saveRoom);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('addTenantBtn').addEventListener('click', addTenant);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);

    // Event listeners for input changes to trigger recalculation
    totalColdRentInput.addEventListener('input', () => {
        calculateRent();
        markDataAsChanged(); // Mark data as changed on input
    });
    utilitiesInput.addEventListener('input', () => {
        calculateRent();
        markDataAsChanged(); // Mark data as changed on input
    });
    // Note: Changes to rooms and tenants will trigger recalculation within their respective functions

    // Event listener for file import
    // Event listener for file import
    // The event listener for the import button is now in ui.js
    importFileInput.addEventListener('change', importData);

    // Initialize Materialize components
    var dropdownElems = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdownElems, { coverTrigger: false });

    initializeMaterializeSelects();
});

// --- Save Warning ---
window.addEventListener('beforeunload', (event) => {
    if (dataChanged) {
        // Cancel the event
        event.preventDefault();
        // Chrome requires returnValue to be set
        event.returnValue = '';
        // Show custom modal
        showSaveWarningModal();
    }
});

// --- Save Warning Modal Button Event Listeners ---
if (exportBeforeCloseBtn) {
    exportBeforeCloseBtn.addEventListener('click', () => {
        exportData(); // Export data
        markDataAsSaved(); // Mark data as saved
        // Allow the page to unload
        window.removeEventListener('beforeunload', handleBeforeUnload); // Temporarily remove listener
        window.location.reload(); // Or navigate away
    });
}

if (closeWithoutSavingBtn) {
    closeWithoutSavingBtn.addEventListener('click', () => {
        markDataAsSaved(); // Mark data as saved to bypass beforeunload check
        // Allow the page to unload
        window.removeEventListener('beforeunload', handleBeforeUnload); // Temporarily remove listener
        window.location.reload(); // Or navigate away
    });
}

// Helper function to re-add the event listener after navigation
function handleBeforeUnload(event) {
    if (dataChanged) {
        event.preventDefault();
        event.returnValue = '';
        showSaveWarningModal();
    }
}

// Re-add the event listener after the page has potentially reloaded or navigated
window.addEventListener('load', () => {
    window.addEventListener('beforeunload', handleBeforeUnload);
});
