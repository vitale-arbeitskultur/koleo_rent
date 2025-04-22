import { renderRoomList, renderTenantList, populateTenantSelect, totalColdRentInput, utilitiesInput, roomNameInput, roomAreaInput, roomTenantSelect, isCommonAreaCheckbox, importFileInput, importDataBtn, initializeMaterializeSelects } from './ui.js';
import { addTenant } from './tenants.js';
import { addRoom, saveRoom, cancelEdit } from './rooms.js';
import { calculateRent } from './calculation.js';
import { exportData, importData } from './io.js';

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
    totalColdRentInput.addEventListener('input', calculateRent);
    utilitiesInput.addEventListener('input', calculateRent);
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
