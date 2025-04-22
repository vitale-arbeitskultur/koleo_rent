import { data } from './data.js';
import { renderTenantList, populateTenantSelect, resultsDiv, addTenantRow, initializeMaterializeSelects, showMessage } from './ui.js';
import { MESSAGES } from './constants.js';
import { calculateRent } from './calculation.js';

/**
 * Initiates the process of adding a new tenant by adding a new input row to the tenant table.
 */
export function addTenant() {
    addTenantRow();
}

/**
 * Saves a new tenant with the provided name.
 * Performs validation to ensure the name is not empty and the tenant does not already exist.
 * @param {string} name - The name of the tenant to save.
 */
export function saveTenant(name) {
    if (!name) {
        showMessage(MESSAGES.TENANT_NAME_REQUIRED, 'error');
        return;
    }
    // Check if tenant already exists
    if (data.tenants.some(tenant => tenant.name.toLowerCase() === name.toLowerCase())) {
        showMessage(MESSAGES.TENANT_EXISTS(name), 'error'); // Use template literal for consistency
        return;
    }

    const newTenant = {
        id: Date.now(), // Einfache eindeutige ID
        name: name
    };

    data.tenants.push(newTenant);
    markDataAsChanged(); // Mark data as changed
    renderTenantList();
    populateTenantSelect(); // Update tenant dropdown in room form
    initializeMaterializeSelects(); // Re-initialize Materialize select
    calculateRent(); // Recalculate after adding a tenant
}

/**
 * Deletes a tenant with the specified ID.
 * Prevents deletion if the tenant is assigned to any rooms.
 * @param {number} id - The ID of the tenant to delete.
 */
export function deleteTenant(id) {
    // Check if any rooms are assigned to this tenant
    const assignedRooms = data.rooms.filter(room => room.tenantId === id);
    if (assignedRooms.length > 0) {
        const roomNames = assignedRooms.map(room => room.name).join(', ');
        showMessage(MESSAGES.TENANT_ASSIGNED_ROOMS(roomNames), 'error'); // Use template literal for consistency
        return;
    }
    data.tenants = data.tenants.filter(tenant => tenant.id !== id);
    markDataAsChanged(); // Mark data as changed
    renderTenantList();
    populateTenantSelect(); // Update tenant dropdown
    initializeMaterializeSelects(); // Re-initialize Materialize select
    calculateRent(); // Recalculate after deleting a tenant
}

/**
 * Initiates the editing process for a tenant with the specified ID.
 * Prompts the user for a new name and updates the tenant data after validation.
 * @param {number} id - The ID of the tenant to edit.
 */
export function editTenant(id) {
    const tenantToEdit = data.tenants.find(tenant => tenant.id === id);
    if (!tenantToEdit) return;

    const newName = prompt(`Mieter "${tenantToEdit.name}" bearbeiten. Neuer Name:`, tenantToEdit.name);

    if (newName === null || newName.trim() === '') {
        showMessage(MESSAGES.TENANT_NAME_EMPTY, 'error');
        return;
    }

    const trimmedName = newName.trim();

    // Check for duplicate name, excluding the tenant being edited
    if (data.tenants.some(tenant => tenant.id !== id && tenant.name.toLowerCase() === trimmedName.toLowerCase())) {
        showMessage(MESSAGES.TENANT_EXISTS(trimmedName), 'error'); // Use template literal for consistency
        return;
    }

    tenantToEdit.name = trimmedName;
    markDataAsChanged(); // Mark data as changed
    renderTenantList();
    populateTenantSelect(); // Update tenant dropdown
    initializeMaterializeSelects(); // Re-initialize Materialize select
    resultsDiv.style.display = 'none'; // Hide old results
    calculateRent(); // Recalculate after editing a tenant
}