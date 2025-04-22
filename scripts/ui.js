import { data } from './data.js';
import { deleteTenant, editTenant, saveTenant } from './tenants.js';
import { deleteRoom, editRoom } from './rooms.js';
import { calculateRent } from './calculation.js';
import { importData } from './io.js';

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
// --- Rendering Functions ---
export function renderTenantList() {
    // This function will now only render existing tenants, not the input row
    const existingTenantRows = tenantTableBody.querySelectorAll('tr:not(.new-tenant-row)');
    existingTenantRows.forEach(row => row.remove());

    if (data.tenants.length === 0) {
        const row = tenantTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = 'Noch keine Mieter hinzugefügt.';
        cell.style.textAlign = 'center';
    } else {
        data.tenants.forEach(tenant => {
            const row = tenantTableBody.insertRow();
            row.insertCell().textContent = tenant.name;

            const actionCell = row.insertCell();

            const editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-edit', 'icon-button'); // Using Font Awesome classes
            editIcon.title = 'Bearbeiten'; // Add tooltip
            editIcon.addEventListener('click', () => editTenant(tenant.id));
            actionCell.appendChild(editIcon);

            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash-alt', 'icon-button', 'delete-btn'); // Using Font Awesome classes
            deleteIcon.title = 'Löschen'; // Add tooltip
            deleteIcon.addEventListener('click', () => deleteTenant(tenant.id));
            actionCell.appendChild(deleteIcon);
        });
    }
}

export function addTenantRow() {
    // Remove any existing new tenant row
    const existingNewRow = tenantTableBody.querySelector('.new-tenant-row');
    if (existingNewRow) {
        existingNewRow.remove();
    }

    const row = tenantTableBody.insertRow(0); // Insert at the top
    row.classList.add('new-tenant-row');

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

export function renderRoomList() {
    roomTableBody.innerHTML = ''; // Liste leeren
    let currentTotalArea = 0;

    if (data.rooms.length === 0) {
        const row = roomTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.textContent = 'Noch keine Räume hinzugefügt.';
        cell.style.textAlign = 'center';
    } else {
        data.rooms.forEach(room => {
            currentTotalArea += room.area;
            const row = roomTableBody.insertRow();
            row.insertCell().textContent = room.name;
            row.insertCell().textContent = room.area.toFixed(2);
            const assignedTenant = data.tenants.find(t => t.id === room.tenantId);
            row.insertCell().textContent = assignedTenant ? assignedTenant.name : '-';
            row.insertCell().textContent = room.isCommonArea ? 'Ja' : 'Nein';

            const actionCell = row.insertCell();

            const editIcon = document.createElement('i');
            editIcon.classList.add('fas', 'fa-edit', 'icon-button'); // Using Font Awesome classes
            editIcon.title = 'Bearbeiten'; // Add tooltip
            editIcon.addEventListener('click', () => editRoom(room.id));
            actionCell.appendChild(editIcon);

            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash-alt', 'icon-button', 'delete-btn'); // Using Font Awesome classes
            deleteIcon.title = 'Löschen'; // Add tooltip
            deleteIcon.addEventListener('click', () => deleteRoom(room.id));
            actionCell.appendChild(deleteIcon);
        });
    }
    totalAreaDisplaySpan.textContent = currentTotalArea.toFixed(2);
    resultsDiv.style.display = 'none'; // Hide results after room list changes
    noCalculationMessage.style.display = 'block'; // Show message
}

export function populateTenantSelect() {
    roomTenantSelect.innerHTML = '<option value="-1">Kein Mieter</option>'; // Default option
    data.tenants.forEach(tenant => {
        const option = document.createElement('option');
        option.value = tenant.id;
        option.textContent = tenant.name;
        roomTenantSelect.appendChild(option);
    });
}

export function clearRoomForm() {
    roomNameInput.value = '';
    roomAreaInput.value = '';
    roomTenantSelect.value = '-1'; // Reset tenant selection
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
                roomTenantSelect.value = '-1'; // Reset tenant selection when hidden
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

export function renderResults(calculatedData) {
    resultsTableBody.innerHTML = ''; // Clear results

    if (calculatedData.tenantRentData) {
        for (const tenantId in calculatedData.tenantRentData) {
            const tenantData = calculatedData.tenantRentData[tenantId];
            const row = resultsTableBody.insertRow();
            const tenant = data.tenants.find(t => t.id === parseInt(tenantId));
            row.insertCell().textContent = tenant ? tenant.name : 'Unbekannter Mieter';
            row.insertCell().textContent = tenantData.privateArea.toFixed(2);

            const tenantPrivateAreaPercentage = calculatedData.totalPrivateArea > 0 ? (tenantData.privateArea / calculatedData.totalPrivateArea) * 100 : 0;
            row.insertCell().textContent = tenantPrivateAreaPercentage.toFixed(2) + '%';

            row.insertCell().textContent = tenantData.commonAreaShare.toFixed(2);
            row.insertCell().textContent = tenantData.commonCostShare.toFixed(2);
            row.insertCell().textContent = tenantData.coldRent.toFixed(2);
            row.insertCell().textContent = tenantData.utilitiesShare.toFixed(2);
            row.insertCell().textContent = tenantData.totalRent.toFixed(2);
        }
    }

    if (calculatedData.unallocatedArea > 0) {
        const row = resultsTableBody.insertRow();
        row.insertCell().textContent = '(Nicht vermietete Flächen)';
        row.insertCell().textContent = calculatedData.unallocatedArea.toFixed(2);
        row.insertCell().textContent = '0.00%';
        row.insertCell().textContent = '0.00';
        row.insertCell().textContent = '0.00';
        row.insertCell().textContent = calculatedData.unallocatedCost.toFixed(2);
        row.insertCell().textContent = '0.00';
        row.insertCell().textContent = calculatedData.unallocatedCost.toFixed(2);
    }


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