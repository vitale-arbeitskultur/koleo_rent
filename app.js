import { renderRoomList, renderTenantList, populateTenantSelect, totalColdRentInput, utilitiesInput, roomNameInput, roomAreaInput, roomTenantSelect, isCommonAreaCheckbox, tenantNameInput, importFileInput } from './ui.js';
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
    document.getElementById('calculateRentBtn').addEventListener('click', calculateRent); // Assuming you add an ID to the calculate button

    // Event listeners for input changes to trigger recalculation
    totalColdRentInput.addEventListener('input', calculateRent);
    utilitiesInput.addEventListener('input', calculateRent);
    // Note: Changes to rooms and tenants will trigger recalculation within their respective functions

    // Event listener for file import
    importFileInput.addEventListener('change', importData);

    // Initialize Materialize Dropdown
    var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems, { coverTrigger: false });
});

// Expose functions to the global scope for inline event handlers in index.html
window.addRoom = addRoom;
window.saveRoom = saveRoom;
window.cancelEdit = cancelEdit;
window.addTenant = addTenant;
window.calculateRent = calculateRent;
window.exportData = exportData;
window.importData = importData;