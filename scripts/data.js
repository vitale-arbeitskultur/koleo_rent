export let data = {
    totalColdRent: 0,
    utilities: 0, // Utilities prepayment
    rooms: [], // Structure: {id: number, name: string, area: number, tenantId: number | null, isCommonArea: boolean}
    tenants: [] // Structure: {id: number, name: string}
};

export function setData(newData) {
    data = newData;
}