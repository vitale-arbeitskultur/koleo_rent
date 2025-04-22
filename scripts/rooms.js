import { data } from './data.js';
import { renderRoomList, clearRoomForm, roomNameInput, roomAreaInput, roomTenantSelect, isCommonAreaCheckbox } from './ui.js';
import { calculateRent } from './calculation.js';

let editingRoomId = null; // To keep track of the room being edited

export function addRoom() {
    const name = roomNameInput.value.trim();
    const area = parseFloat(roomAreaInput.value);
    const tenantId = parseInt(roomTenantSelect.value); // Get selected tenant ID
    const isCommon = isCommonAreaCheckbox.checked;

    if (!name || isNaN(area) || area <= 0) {
        alert('Bitte gültigen Raumnamen und eine positive Fläche eingeben.');
        return;
    }

    // If it's a common area, tenantId should be null
    const assignedTenantId = isCommon ? null : (tenantId === -1 ? null : tenantId); // -1 for "Kein Mieter" option

    const newRoom = {
        id: Date.now(), // Simple unique ID
        name: name,
        area: area,
        tenantId: assignedTenantId,
        isCommonArea: isCommon
    };

    data.rooms.push(newRoom);
    renderRoomList();
    clearRoomForm();
    M.FormSelect.init(roomTenantSelect); // Re-initialize Materialize select
    calculateRent(); // Recalculate after adding a room
}

export function deleteRoom(id) {
    data.rooms = data.rooms.filter(room => room.id !== id);
    renderRoomList();
    calculateRent(); // Recalculate after deleting a room
}

export function editRoom(id) {
    const roomToEdit = data.rooms.find(room => room.id === id);
    if (!roomToEdit) return;

    // Populate the form with room data
    roomNameInput.value = roomToEdit.name;
    roomAreaInput.value = roomToEdit.area;
    roomTenantSelect.value = roomToEdit.tenantId === null ? '-1' : roomToEdit.tenantId;
    isCommonAreaCheckbox.checked = roomToEdit.isCommonArea;

    // Hide Add button, show Save and Cancel buttons
    document.getElementById('addRoomBtn').style.display = 'none';
    document.getElementById('saveRoomBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    editingRoomId = id; // Store the ID of the room being edited
}

export function saveRoom() {
    if (editingRoomId === null) return; // Should not happen if buttons are managed correctly

    const roomToUpdate = data.rooms.find(room => room.id === editingRoomId);
    if (!roomToUpdate) return;

    const name = roomNameInput.value.trim();
    const area = parseFloat(roomAreaInput.value);
    const tenantId = parseInt(roomTenantSelect.value);
    const isCommon = isCommonAreaCheckbox.checked;

    if (!name || isNaN(area) || area <= 0) {
        alert('Bitte gültigen Raumnamen und eine positive Fläche eingeben.');
        return;
    }

    // If it's a common area, tenantId should be null
    const assignedTenantId = isCommon ? null : (tenantId === -1 ? null : tenantId);

    roomToUpdate.name = name;
    roomToUpdate.area = area;
    roomToUpdate.tenantId = assignedTenantId;
    roomToUpdate.isCommonArea = isCommon;

    renderRoomList();
    clearRoomForm();
    M.FormSelect.init(roomTenantSelect); // Re-initialize Materialize select
    cancelEdit(); // Reset buttons and editing state
    calculateRent(); // Recalculate after saving a room
}

export function cancelEdit() {
    clearRoomForm();
    document.getElementById('addRoomBtn').style.display = 'inline-block';
    document.getElementById('saveRoomBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
    editingRoomId = null; // Clear editing state
}