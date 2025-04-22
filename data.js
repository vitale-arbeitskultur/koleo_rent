export let data = {
    totalColdRent: 0,
    utilities: 0, // Nebenkosten-Vorauszahlung
    rooms: [], // Struktur: {id: number, name: string, area: number, tenantId: number | null, isCommonArea: boolean}
    tenants: [] // Struktur: {id: number, name: string}
};

export function setData(newData) {
    data = newData;
}