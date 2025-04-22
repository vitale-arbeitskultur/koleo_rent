import { renderRoomList, renderTenantList, populateTenantSelect, totalColdRentInput, utilitiesInput, roomNameInput, roomAreaInput, roomTenantSelect, isCommonAreaCheckbox, tenantNameInput, importFileInput, importButtonContainer } from './ui.js';
import { addTenant } from './tenants.js';
import { addRoom, saveRoom, cancelEdit } from './rooms.js';
import { calculateRent } from './calculation.js';
import { exportData, importData } from './io.js';

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    renderRoomList(); // Initial leere Liste anzeigen
    renderTenantList(); // Initial leere Mieterliste anzeigen
    populateTenantSelect(); // Initial leeres Dropdown füllen

    // Attach event listeners to buttons and inputs
    document.getElementById('addRoomBtn').addEventListener('click', addRoom);
    document.getElementById('saveRoomBtn').addEventListener('click', saveRoom);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('addTenantBtn').addEventListener('click', addTenant);
    document.getElementById('calculateRentBtn').addEventListener('click', () => {
        console.log('Calculate Rent button clicked'); // Add console log
        calculateRent();
    });
    document.getElementById('exportDataBtn').addEventListener('click', exportData);

    // Event listeners for input changes to trigger recalculation
    totalColdRentInput.addEventListener('input', calculateRent);
    utilitiesInput.addEventListener('input', calculateRent);
    // Note: Changes to rooms and tenants will trigger recalculation within their respective functions

    // Event listener for file import
    importFileInput.addEventListener('change', importData);
    importButtonContainer.addEventListener('click', () => importFileInput.click());

    // Initialize Materialize components
    var dropdownElems = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdownElems, { coverTrigger: false });

    var selectElems = document.querySelectorAll('select');
    M.FormSelect.init(selectElems);
});
