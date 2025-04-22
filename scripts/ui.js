import { data } from './data.js';
import { deleteTenant, editTenant, saveTenant } from './tenants.js';
import { deleteRoom, editRoom } from './rooms.js';
import { calculateRent } from './calculation.js';
import { importData } from './io.js';
import {
    MESSAGES,
    DEFAULT_TENANT_SELECT_VALUE,
    UNKNOWN_TENANT_NAME,
    YES_TEXT,
    NO_TEXT,
    TENANT_GROUP_1_CLASS,
    TENANT_GROUP_2_CLASS,
    NEW_TENANT_ROW_CLASS,
    NO_TENANTS_MESSAGE_CLASS,
    NEW_ROOM_ROW_CLASS,
    NO_ROOMS_MESSAGE_CLASS,
    UNALLOCATED_ROW_CLASS
} from './constants.js';

// --- DOM Elemente ---
export const totalColdRentInput = document.getElementById('totalColdRent');
export const utilitiesInput = document.getElementById('utilities');
export const roomNameInput = document.getElementById('roomName');
export const roomAreaInput = document.getElementById('roomArea');
export const roomTenantSelect = document.getElementById('roomTenantSelect');
export const roomTableBody = document.getElementById('roomTableBody');

export const tenantTableBody = document.getElementById('tenantTableBody');
export const resultsDiv = document.getElementById('results');
export const resultsTableBody = document.getElementById('resultsTableBody');
export const calculationSummaryDiv = document.getElementById('calculationSummary');
export const checksumRentSpan = document.getElementById('checksumRent');
export const totalAreaDisplaySpan = document.getElementById('totalAreaDisplay');
export const importFileInput = document.getElementById('importFile');
export const importDataBtn = document.getElementById('importDataBtn');
export const noCalculationMessage = document.getElementById('noCalculationMessage');
export const messageArea = document.getElementById('messageArea');
export const messageText = document.getElementById('messageText');

// --- Utility Functions ---
/**
 * Displays a message to the user in the message area.
 * @param {string} message - The message to display.
 * @param {'info' | 'error'} [type='info'] - The type of message (info or error) to determine styling.
 */
export function showMessage(message, type = 'info') {
    messageText.textContent = message;
    messageArea.classList.remove('teal', 'red'); // Remove previous color classes
    messageArea.style.display = 'block';
    if (type === 'error') {
        messageArea.classList.add('red');
    } else {
        messageArea.classList.add('teal', 'lighten-2');
    }
    // Automatically hide after 5 seconds
    setTimeout(hideMessage, 5000);
}

/**
 * Hides the message area.
 */
export function hideMessage() {
    messageArea.style.display = 'none';
    messageText.textContent = '';
}


// --- Rendering Functions ---
/**
 * Renders the list of tenants in the tenant table.
 * Updates existing rows or adds/removes rows as needed for efficiency.
 */
export function renderTenantList() {
    const existingRows = tenantTableBody.querySelectorAll(`tr:not(.${NEW_TENANT_ROW_CLASS})`);
    const existingTenantIds = Array.from(existingRows).map(row => parseInt(row.dataset.tenantId));

    const currentTenantIds = data.tenants.map(tenant => tenant.id);

    // Remove rows for tenants that no longer exist
    existingRows.forEach(row => {
        const tenantId = parseInt(row.dataset.tenantId);
        if (!currentTenantIds.includes(tenantId)) {
            row.remove();
        }
    });

    // Add or update rows for current tenants
    data.tenants.forEach(tenant => {
        let row = tenantTableBody.querySelector(`tr[data-tenant-id="${tenant.id}"]`);

        if (!row) {
            // Add new row
            row = tenantTableBody.insertRow();
            row.dataset.tenantId = tenant.id; // Store tenant ID on the row
            row.insertCell(); // Name cell
            row.insertCell(); // Action cell

            const actionCell = row.cells[1];

            const editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-edit', 'icon-button');
            editIcon.title = 'Bearbeiten';
            editIcon.addEventListener('click', () => editTenant(tenant.id));
            actionCell.appendChild(editIcon);

            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash-alt', 'icon-button', 'delete-btn');
            deleteIcon.title = 'Löschen';
            deleteIcon.addEventListener('click', () => deleteTenant(tenant.id));
            actionCell.appendChild(deleteIcon);

        }

        // Update name cell
        row.cells[0].textContent = tenant.name;
    });

    // Handle the "No tenants added" message
    const noTenantMessageRow = tenantTableBody.querySelector(`.${NO_TENANTS_MESSAGE_CLASS}`);
    if (data.tenants.length === 0) {
        if (!noTenantMessageRow) {
            const row = tenantTableBody.insertRow();
            row.classList.add(NO_TENANTS_MESSAGE_CLASS);
            const cell = row.insertCell();
            cell.colSpan = 2;
            cell.textContent = MESSAGES.NO_TENANTS_ADDED;
            cell.style.textAlign = 'center';
        }
    } else {
        if (noTenantMessageRow) {
            noTenantMessageRow.remove();
        }
    }
}

/**
 * Adds a new input row to the tenant table for adding a new tenant.
 */
export function addTenantRow() {
    // Remove any existing new tenant row
    const existingNewRow = tenantTableBody.querySelector('.new-tenant-row'); // This class is not a constant, should be refactored
    if (existingNewRow) {
        existingNewRow.remove();
    }

    const row = tenantTableBody.insertRow(0); // Insert at the top
    row.classList.add(NEW_TENANT_ROW_CLASS);

    const nameCell = row.insertCell();
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Mietername';
    nameCell.appendChild(nameInput);

    const actionCell = row.insertCell();
    const saveIcon = document.createElement('i');
    saveIcon.classList.add('fas', 'fa-save', 'icon-button'); // Using Font Awesome classes
    saveIcon.title = 'Speichern';
    saveIcon.addEventListener('click', () => {
        saveTenant(nameInput.value);
        row.remove(); // Remove the input row after saving
    });
    actionCell.appendChild(saveIcon);
}

/**
 * Renders the list of rooms in the room table.
 * Updates existing rows or adds/removes rows as needed for efficiency.
 */
export function renderRoomList() {
    const existingRows = roomTableBody.querySelectorAll(`tr:not(.${NEW_ROOM_ROW_CLASS})`); // Exclude potential new room input row
    const existingRoomIds = Array.from(existingRows).map(row => parseInt(row.dataset.roomId));

    const currentRoomIds = data.rooms.map(room => room.id);

    // Remove rows for rooms that no longer exist
    existingRows.forEach(row => {
        const roomId = parseInt(row.dataset.roomId);
        if (!currentRoomIds.includes(roomId)) {
            row.remove();
        }
    });

    // Sort rooms by tenantId, with null tenantId (common areas/unassigned) at the end
    const sortedRooms = [...data.rooms].sort((a, b) => {
        if (a.tenantId === null && b.tenantId === null) return 0;
        if (a.tenantId === null) return 1;
        if (b.tenantId === null) return -1;
        return a.tenantId - b.tenantId;
    });

    let currentTotalArea = 0;
    let currentColorClass = TENANT_GROUP_1_CLASS;
    let previousTenantId = null;

    // Add or update rows for current rooms
    sortedRooms.forEach(room => {
        currentTotalArea += room.area;
        let row = roomTableBody.querySelector(`tr[data-room-id="${room.id}"]`);

        if (!row) {
            // Add new row
            row = roomTableBody.insertRow();
            row.dataset.roomId = room.id; // Store room ID on the row
            row.insertCell(); // Name
            row.insertCell(); // Area
            row.insertCell(); // Tenant
            row.insertCell(); // Common Area
            row.insertCell(); // Actions

            const actionCell = row.cells[4];

            const editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-edit', 'icon-button');
            editIcon.title = 'Bearbeiten';
            editIcon.addEventListener('click', () => editRoom(room.id));
            actionCell.appendChild(editIcon);

            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash-alt', 'icon-button', 'delete-btn');
            deleteIcon.title = 'Löschen';
            deleteIcon.addEventListener('click', () => deleteRoom(room.id));
            actionCell.appendChild(deleteIcon);

        }

        // Update cell content
        row.cells[0].textContent = room.name;
        row.cells[1].textContent = room.area.toFixed(2);
        const assignedTenant = data.tenants.find(t => t.id === room.tenantId);
        row.cells[2].textContent = assignedTenant ? assignedTenant.name : '-'; // Use '-' for no tenant
        row.cells[3].textContent = room.isCommonArea ? YES_TEXT : NO_TEXT; // Use constants for Yes/Nein

        // Update color class if tenant changes
        if (room.tenantId !== previousTenantId) {
            currentColorClass = currentColorClass === TENANT_GROUP_1_CLASS ? TENANT_GROUP_2_CLASS : TENANT_GROUP_1_CLASS;
            previousTenantId = room.tenantId;
        }
        // Remove previous color classes and add the current one
        row.classList.remove(TENANT_GROUP_1_CLASS, TENANT_GROUP_2_CLASS);
        row.classList.add(currentColorClass);
    });

    // Handle the "No rooms added" message
    const noRoomMessageRow = roomTableBody.querySelector(`.${NO_ROOMS_MESSAGE_CLASS}`);
    if (data.rooms.length === 0) {
        if (!noRoomMessageRow) {
            const row = roomTableBody.insertRow();
            row.classList.add(NO_ROOMS_MESSAGE_CLASS);
            const cell = row.insertCell();
            cell.colSpan = 5;
            cell.textContent = MESSAGES.NO_ROOMS_ADDED;
            cell.style.textAlign = 'center';
        }
    } else {
        if (noRoomMessageRow) {
            noRoomMessageRow.remove();
        }
    }


    totalAreaDisplaySpan.textContent = currentTotalArea.toFixed(2);
    resultsDiv.style.display = 'none'; // Hide results after room list changes
    noCalculationMessage.style.display = 'block'; // Show message
}

/**
 * Populates the tenant select dropdown in the room form.
 */
export function populateTenantSelect() {
    roomTenantSelect.innerHTML = `<option value="${DEFAULT_TENANT_SELECT_VALUE}">Kein Mieter</option>`; // Default option using constant
    data.tenants.forEach(tenant => {
        const option = document.createElement('option');
        option.value = tenant.id;
        option.textContent = tenant.name;
        roomTenantSelect.appendChild(option);
    });
}

/**
 * Initializes Materialize select dropdowns.
 */
export function initializeMaterializeSelects() {
    var selectElems = document.querySelectorAll('select');
    M.FormSelect.init(selectElems);
}

/**
 * Clears the room form inputs.
 */
export function clearRoomForm() {
    roomNameInput.value = '';
    roomAreaInput.value = '';
    roomTenantSelect.value = DEFAULT_TENANT_SELECT_VALUE; // Reset tenant selection using constant
    isCommonAreaCheckbox.checked = false;
}

// --- Event Listeners ---
export const isCommonAreaCheckbox = document.getElementById('isCommonArea');

document.addEventListener('DOMContentLoaded', function() {
    if (isCommonAreaCheckbox) { // Add a check to ensure the element exists
        isCommonAreaCheckbox.addEventListener('change', function() {
            const tenantSelectContainer = roomTenantSelect.closest('.input-field');
            if (this.checked) {
                tenantSelectContainer.style.display = 'none';
                roomTenantSelect.value = DEFAULT_TENANT_SELECT_VALUE; // Reset tenant selection when hidden using constant
            } else {
                tenantSelectContainer.style.display = ''; // Or 'block', depending on default
            }
        });
    }

    // Add event listener for the new import button
    if (importDataBtn && importFileInput) {
        importDataBtn.addEventListener('click', function() {
            importFileInput.click(); // Trigger the hidden file input
        });
        importFileInput.addEventListener('change', importData); // Handle file selection
    }
});

/**
 * Renders the calculation results in the results table and summary area.
 * Updates existing rows or adds/removes rows as needed for efficiency.
 * @param {object} calculatedData - The data object containing calculation results.
 */
export function renderResults(calculatedData) {
    // Hide results and show message if data is incomplete
    if (calculatedData.totalColdRent <= 0 || calculatedData.totalArea === 0 || (calculatedData.totalPrivateArea <= 0 && Object.keys(calculatedData.tenantRentData).length > 0)) {
        resultsDiv.style.display = 'none';
        noCalculationMessage.style.display = 'block';
        return; // Stop rendering here
    }

    const existingRows = resultsTableBody.querySelectorAll('tr');
    const existingTenantIds = Array.from(existingRows)
        .filter(row => row.dataset.tenantId) // Exclude the unallocated row
        .map(row => parseInt(row.dataset.tenantId));

    const currentTenantIds = Object.keys(calculatedData.tenantRentData).map(id => parseInt(id));

    // Remove rows for tenants that no longer exist in the calculation results
    existingRows.forEach(row => {
        if (row.dataset.tenantId) { // Check if it's a tenant row
            const tenantId = parseInt(row.dataset.tenantId);
            if (!currentTenantIds.includes(tenantId)) {
                row.remove();
            }
        }
    });

    // Add or update rows for current tenants
    for (const tenantId in calculatedData.tenantRentData) {
        const tenantData = calculatedData.tenantRentData[tenantId];
        let row = resultsTableBody.querySelector(`tr[data-tenant-id="${tenantId}"]`);

        if (!row) {
            // Add new row
            row = resultsTableBody.insertRow();
            row.dataset.tenantId = tenantId; // Store tenant ID on the row
            row.insertCell(); // Tenant Name
            row.insertCell(); // Private Area
            row.insertCell(); // Private Area Percentage
            row.insertCell(); // Common Area Share
            row.insertCell(); // Common Cost Share
            row.insertCell(); // Cold Rent
            row.insertCell(); // Utilities Share
            row.insertCell(); // Total Rent
        }

        // Update cell content
        const tenant = data.tenants.find(t => t.id === parseInt(tenantId));
        row.cells[0].textContent = tenant ? tenant.name : UNKNOWN_TENANT_NAME; // Use constant for unknown tenant
        row.cells[1].textContent = tenantData.privateArea.toFixed(2);
        const tenantPrivateAreaPercentage = calculatedData.totalPrivateArea > 0 ? (tenantData.privateArea / calculatedData.totalPrivateArea) * 100 : 0;
        row.cells[2].textContent = tenantPrivateAreaPercentage.toFixed(2) + '%';
        row.cells[3].textContent = tenantData.commonAreaShare.toFixed(2);
        row.cells[4].textContent = tenantData.commonCostShare.toFixed(2);
        row.cells[5].textContent = tenantData.coldRent.toFixed(2);
        row.cells[6].textContent = tenantData.utilitiesShare.toFixed(2);
        row.cells[7].textContent = tenantData.totalRent.toFixed(2);
    }

    // Handle the unallocated area row
    let unallocatedRow = resultsTableBody.querySelector(`tr.${UNALLOCATED_ROW_CLASS}`);
    if (calculatedData.unallocatedArea > 0) {
        if (!unallocatedRow) {
            unallocatedRow = resultsTableBody.insertRow();
            unallocatedRow.classList.add(UNALLOCATED_ROW_CLASS);
            unallocatedRow.insertCell().textContent = MESSAGES.UNALLOCATED_AREA; // Use constant for unallocated area text
            unallocatedRow.insertCell(); // Area
            unallocatedRow.insertCell().textContent = '0.00%';
            unallocatedRow.insertCell().textContent = '0.00';
            unallocatedRow.insertCell().textContent = '0.00';
            unallocatedRow.insertCell(); // Unallocated Cost
            unallocatedRow.insertCell().textContent = '0.00';
            unallocatedRow.insertCell(); // Total Unallocated Cost
        }
        unallocatedRow.cells[1].textContent = calculatedData.unallocatedArea.toFixed(2);
        unallocatedRow.cells[5].textContent = calculatedData.unallocatedCost.toFixed(2);
        unallocatedRow.cells[7].textContent = calculatedData.unallocatedCost.toFixed(2);
    } else {
        if (unallocatedRow) {
            unallocatedRow.remove();
        }
    }


    // Update calculation summary
    calculationSummaryDiv.innerHTML = `
        Gesamtkaltmiete: ${calculatedData.totalColdRent.toFixed(2)} €<br>
        Monatliche Nebenkosten-Vorauszahlung: ${calculatedData.utilities.toFixed(2)} €<br>
        Gesamtfläche: ${calculatedData.totalArea.toFixed(2)} m² (davon ${calculatedData.totalPrivateArea.toFixed(2)} m² privat vermietet, ${calculatedData.totalCommonArea.toFixed(2)} m² Gemeinschaft)<br>
        Kosten pro m² (gesamt): ${calculatedData.rentPerTotalSqm.toFixed(4)} €<br>
        Gesamtkosten Gemeinschaftsfläche: ${calculatedData.totalCommonCost.toFixed(2)} € (werden auf Mieter umgelegt)
    `;

    checksumRentSpan.textContent = calculatedData.calculatedTotalRentSum.toFixed(2);
    resultsDiv.style.display = 'block'; // Show results
    noCalculationMessage.style.display = 'none'; // Hide message
}