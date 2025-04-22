import { data } from './data.js';
import { renderTenantList, populateTenantSelect, resultsDiv, tenantNameInput } from './ui.js';
import { calculateRent } from './calculation.js';

export function addTenant() {
    const name = tenantNameInput.value.trim();
    if (!name) {
        alert("Bitte einen Mietername eingeben.");
        return;
    }
    // Check if tenant already exists
    if (data.tenants.some(tenant => tenant.name.toLowerCase() === name.toLowerCase())) {
        alert(`Mieter "${name}" existiert bereits.`);
        return;
    }

    const newTenant = {
        id: Date.now(), // Einfache eindeutige ID
        name: name
    };

    data.tenants.push(newTenant);
    renderTenantList();
    populateTenantSelect(); // Update tenant dropdown in room form
    tenantNameInput.value = ''; // Clear input
    calculateRent(); // Recalculate after adding a tenant
}

export function deleteTenant(id) {
    // Check if any rooms are assigned to this tenant
    const assignedRooms = data.rooms.filter(room => room.tenantId === id);
    if (assignedRooms.length > 0) {
        const roomNames = assignedRooms.map(room => room.name).join(', ');
        alert(`Mieter kann nicht gelöscht werden, da noch Räume zugewiesen sind: ${roomNames}`);
        return;
    }
    data.tenants = data.tenants.filter(tenant => tenant.id !== id);
    renderTenantList();
    populateTenantSelect(); // Update tenant dropdown
    calculateRent(); // Recalculate after deleting a tenant
}

export function editTenant(id) {
    const tenantToEdit = data.tenants.find(tenant => tenant.id === id);
    if (!tenantToEdit) return;

    const newName = prompt(`Mieter "${tenantToEdit.name}" bearbeiten. Neuer Name:`, tenantToEdit.name);

    if (newName === null || newName.trim() === '') {
        alert("Mietername darf nicht leer sein.");
        return;
    }

    const trimmedName = newName.trim();

    // Check for duplicate name, excluding the tenant being edited
    if (data.tenants.some(tenant => tenant.id !== id && tenant.name.toLowerCase() === trimmedName.toLowerCase())) {
        alert(`Mieter "${trimmedName}" existiert bereits.`);
        return;
    }

    tenantToEdit.name = trimmedName;
    renderTenantList();
    populateTenantSelect(); // Update tenant dropdown
    resultsDiv.style.display = 'none'; // Hide old results
    calculateRent(); // Recalculate after editing a tenant
}