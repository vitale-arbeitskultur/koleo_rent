export let data = {
    totalColdRent: 0,
    utilities: 0, // Utilities prepayment
    rooms: [], // Structure: {id: number, name: string, area: number, tenantId: number | null, isCommonArea: boolean}
    tenants: [] // Structure: {id: number, name: string}
};

export let dataChanged = false;

export function markDataAsChanged() {
    dataChanged = true;
}

export function markDataAsSaved() {
    dataChanged = false;
}

/**
 * Sets the entire application data object.
 * @param {object} newData - The new data object to set.
 */
export function setData(newData) {
    data = newData;
}