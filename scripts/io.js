import { data, setData } from './data.js';
import { totalColdRentInput, utilitiesInput, renderRoomList, renderTenantList, populateTenantSelect, resultsDiv, importFileInput, initializeMaterializeSelects, showMessage } from './ui.js';
import { MESSAGES } from './constants.js';
import { calculateRent } from './calculation.js';

/**
 * Exports the current application data (total cold rent, utilities, rooms, and tenants) as a JSON file.
 */
export function exportData() {
    // Update totalColdRent and utilities in data object before exporting
    const currentTotalColdRent = parseFloat(totalColdRentInput.value);
    if (!isNaN(currentTotalColdRent)) {
        data.totalColdRent = currentTotalColdRent;
    } else {
        data.totalColdRent = 0; // Default or keep existing if input invalid
    }

    const currentUtilities = parseFloat(utilitiesInput.value);
    if (!isNaN(currentUtilities)) {
        data.utilities = currentUtilities;
    } else {
        data.utilities = 0; // Default or keep existing if input invalid
    }

    const dataStr = JSON.stringify(data, null, 2); // Pretty print JSON
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'coworking_data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    markDataAsSaved(); // Mark data as saved after export
}

/**
 * Imports data from a selected JSON file.
 * Validates the file type and data structure before updating the application data and UI.
 * @param {Event} event - The file input change event.
 */
export function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        // Assuming importFileNameSpan exists and is the correct element
        // importFileNameSpan.textContent = MESSAGES.NO_FILE_SELECTED;
        // The above line is commented out because importFileNameSpan is not defined in this scope.
        // A more robust solution would involve passing this element or using a different UI update method.
        // For now, we'll just return.
        return;
    }
    if (file.type !== "application/json") {
        showMessage(MESSAGES.FILE_TYPE_ERROR, 'error');
        importFileInput.value = ''; // Reset file input
        return;
    }


    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Basic validation of imported structure
            if (typeof importedData.totalColdRent !== 'number' || !Array.isArray(importedData.rooms) || !Array.isArray(importedData.tenants)) {
                throw new Error(MESSAGES.FILE_IMPORT_INVALID_JSON);
            }
            // Deeper validation could be added here (e.g., check room properties)

            setData(importedData); // Use the setter function

            // Update UI
            totalColdRentInput.value = data.totalColdRent || 0;
            utilitiesInput.value = data.utilities || 0;
            renderRoomList();
            renderTenantList(); // Render tenant list after import
            populateTenantSelect(); // Repopulate tenant select dropdown
            initializeMaterializeSelects(); // Re-initialize Materialize select
            calculateRent(); // Recalculate and render results after import
            showMessage(MESSAGES.FILE_IMPORT_SUCCESS, 'info');

        } catch (error) {
            showMessage(MESSAGES.FILE_IMPORT_ERROR(error.message), 'error');
        } finally {
            // Reset file input so the same file can be loaded again if needed
            importFileInput.value = '';
        }
    };
    reader.onerror = function() {
        showMessage(MESSAGES.FILE_READ_ERROR, 'error');
        importFileInput.value = ''; // Reset file input
    }
    reader.readAsText(file);
}