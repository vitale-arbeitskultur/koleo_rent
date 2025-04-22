import { data, setData } from './data.js';
import { totalColdRentInput, utilitiesInput, renderRoomList, renderTenantList, populateTenantSelect, resultsDiv, importFileInput, importFileNameSpan } from './ui.js';
import { calculateRent } from './calculation.js';

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
}

export function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        importFileNameSpan.textContent = 'Keine Datei ausgewählt';
        return;
    }
    if (file.type !== "application/json") {
        alert("Bitte nur JSON-Dateien auswählen!");
        importFileInput.value = ''; // Reset file input
        importFileNameSpan.textContent = 'Keine Datei ausgewählt';
        return;
    }

    importFileNameSpan.textContent = file.name; // Show selected file name

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Basic validation of imported structure
            if (typeof importedData.totalColdRent !== 'number' || !Array.isArray(importedData.rooms) || !Array.isArray(importedData.tenants)) {
                throw new Error("Ungültige Datenstruktur in der JSON-Datei.");
            }
            // Deeper validation could be added here (e.g., check room properties)

            setData(importedData); // Use the setter function

            // Update UI
            totalColdRentInput.value = data.totalColdRent || 0;
            utilitiesInput.value = data.utilities || 0;
            renderRoomList();
            renderTenantList(); // Render tenant list after import
            populateTenantSelect(); // Repopulate tenant select dropdown
            resultsDiv.style.display = 'none'; // Hide old results
            alert("Daten erfolgreich importiert!");

        } catch (error) {
            alert("Fehler beim Parsen der JSON-Datei: " + error.message);
            importFileNameSpan.textContent = 'Fehler beim Import';
        } finally {
            // Reset file input so the same file can be loaded again if needed
            importFileInput.value = '';
        }
    };
    reader.onerror = function() {
        alert("Fehler beim Lesen der Datei.");
        importFileNameSpan.textContent = 'Fehler beim Lesen';
        importFileInput.value = ''; // Reset file input
    }
    reader.readAsText(file);
}