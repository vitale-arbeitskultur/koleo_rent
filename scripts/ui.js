import { data } from './data.js';
import { deleteTenant, editTenant } from './tenants.js'; // Assuming tenants.js will have these
import { deleteRoom, editRoom } from './rooms.js'; // Assuming rooms.js will have these
import { calculateRent } from './calculation.js'; // Assuming calculation.js will have this
import { importData } from './io.js'; // Assuming io.js will have this

// --- DOM Elemente ---
export const totalColdRentInput = document.getElementById('totalColdRent');
export const utilitiesInput = document.getElementById('utilities');
export const roomNameInput = document.getElementById('roomName');
export const roomAreaInput = document.getElementById('roomArea');
export const roomTenantSelect = document.getElementById('roomTenantSelect');
export const isCommonAreaCheckbox = document.getElementById('isCommonArea');
export const roomTableBody = document.getElementById('roomTableBody');

export const tenantNameInput = document.getElementById('tenantNameInput');
export const tenantTableBody = document.getElementById('tenantTableBody');
export const resultsDiv = document.getElementById('results');
export const resultsTableBody = document.getElementById('resultsTableBody');
export const calculationSummaryDiv = document.getElementById('calculationSummary');
export const checksumRentSpan = document.getElementById('checksumRent');
export const totalAreaDisplaySpan = document.getElementById('totalAreaDisplay');
export const importFileInput = document.getElementById('importFile');
export const importFileNameSpan = document.getElementById('importFileName');

// --- Rendering Functions ---
export function renderTenantList() {
    tenantTableBody.innerHTML = ''; // Liste leeren

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

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Bearbeiten';
            editBtn.onclick = () => editTenant(tenant.id);
            actionCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Löschen';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.onclick = () => deleteTenant(tenant.id);
            actionCell.appendChild(deleteBtn);
        });
    }
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

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Bearbeiten';
            editBtn.onclick = () => editRoom(room.id);
            actionCell.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Löschen';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.onclick = () => deleteRoom(room.id);
            actionCell.appendChild(deleteBtn);
        });
    }
    totalAreaDisplaySpan.textContent = currentTotalArea.toFixed(2);
    // Nach jeder Änderung der Raumliste die Ergebnisse ausblenden, da sie veraltet sind
    resultsDiv.style.display = 'none';
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

export function renderResults(calculatedData) {
    resultsTableBody.innerHTML = ''; // Ergebnisse leeren

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
    resultsDiv.style.display = 'block'; // Ergebnisse anzeigen
}