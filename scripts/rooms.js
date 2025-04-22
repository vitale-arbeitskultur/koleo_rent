import { data } from './data.js';
import { renderRoomList, clearRoomForm, roomNameInput, roomAreaInput, roomTenantSelect, isCommonAreaCheckbox, initializeMaterializeSelects, showMessage } from './ui.js';
import { MESSAGES, DEFAULT_TENANT_SELECT_VALUE } from './constants.js';
import { calculateRent } from './calculation.js';

let editingRoomId = null; // To keep track of the room being edited

/**
 * Adds a new room based on the form input values.
 * Performs validation on the input fields.
 */
export function addRoom() {
    const name = roomNameInput.value.trim();
    const area = parseFloat(roomAreaInput.value);
    const tenantId = parseInt(roomTenantSelect.value); // Get selected tenant ID
    const isCommon = isCommonAreaCheckbox.checked;

    if (!name || isNaN(area) || area <= 0) {
        showMessage(MESSAGES.ROOM_INVALID_INPUT, 'error');
        return;
    }

    // If it's a common area, tenantId should be null
    const assignedTenantId = isCommon ? null : (tenantId === parseInt(DEFAULT_TENANT_SELECT_VALUE) ? null : tenantId); // Use constant for default value

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
    initializeMaterializeSelects(); // Re-initialize Materialize select
    calculateRent(); // Recalculate after adding a room
}

/**
 * Deletes a room with the specified ID.
 * @param {number} id - The ID of the room to delete.
 */
export function deleteRoom(id) {
    data.rooms = data.rooms.filter(room => room.id !== id);
    renderRoomList();
    calculateRent(); // Recalculate after deleting a room
}

/**
 * Initiates the editing process for a room with the specified ID.
 * Populates the form with the room's data and updates button visibility.
 * @param {number} id - The ID of the room to edit.
 */
export function editRoom(id) {
    const roomToEdit = data.rooms.find(room => room.id === id);
    if (!roomToEdit) return;

    // Populate the form with room data
    roomNameInput.value = roomToEdit.name;
    roomAreaInput.value = roomToEdit.area;
    roomTenantSelect.value = roomToEdit.tenantId === null ? DEFAULT_TENANT_SELECT_VALUE : roomToEdit.tenantId; // Use constant for default value
    isCommonAreaCheckbox.checked = roomToEdit.isCommonArea;

    // Hide Add button, show Save and Cancel buttons
    document.getElementById('addRoomBtn').style.display = 'none';
    document.getElementById('saveRoomBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    editingRoomId = id; // Store the ID of the room being edited
}

/**
 * Saves the changes to the room being edited based on the form input values.
 * Performs validation on the input fields.
 */
export function saveRoom() {
    if (editingRoomId === null) return; // Should not happen if buttons are managed correctly

    const roomToUpdate = data.rooms.find(room => room.id === editingRoomId);
    if (!roomToUpdate) return;

    const name = roomNameInput.value.trim();
    const area = parseFloat(roomAreaInput.value);
    const tenantId = parseInt(roomTenantSelect.value);
    const isCommon = isCommonAreaCheckbox.checked;

    if (!name || isNaN(area) || area <= 0) {
        showMessage(MESSAGES.ROOM_INVALID_INPUT, 'error');
        return;
    }

    // If it's a common area, tenantId should be null
    const assignedTenantId = isCommon ? null : (tenantId === parseInt(DEFAULT_TENANT_SELECT_VALUE) ? null : tenantId); // Use constant for default value

    roomToUpdate.name = name;
    roomToUpdate.area = area;
    roomToUpdate.tenantId = assignedTenantId;
    roomToUpdate.isCommonArea = isCommon;

    renderRoomList();
    clearRoomForm();
    initializeMaterializeSelects(); // Re-initialize Materialize select
    cancelEdit(); // Reset buttons and editing state
    calculateRent(); // Recalculate after saving a room
}

/**
 * Cancels the room editing process.
 * Clears the form and resets button visibility.
 */
export function cancelEdit() {
    clearRoomForm();
    // Reset tenant select value explicitly when cancelling edit
    roomTenantSelect.value = DEFAULT_TENANT_SELECT_VALUE;
    initializeMaterializeSelects(); // Re-initialize Materialize select after changing value

    document.getElementById('addRoomBtn').style.display = 'inline-block';
    document.getElementById('saveRoomBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
    editingRoomId = null; // Clear editing state
}