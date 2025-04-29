export const MESSAGES = {
    TENANT_NAME_REQUIRED: 'Bitte einen Mietername eingeben.',
    TENANT_EXISTS: (name) => `Mieter "${name}" existiert bereits.`,
    TENANT_ASSIGNED_ROOMS: (roomNames) => `Mieter kann nicht gelöscht werden, da noch Räume zugewiesen sind: ${roomNames}`,
    TENANT_NAME_EMPTY: 'Mietername darf nicht leer sein.',
    ROOM_INVALID_INPUT: 'Bitte gültigen Raumnamen und eine positive Fläche eingeben.',
    NO_TENANTS_ADDED: 'Noch keine Mieter hinzugefügt.',
    NO_ROOMS_ADDED: 'Noch keine Räume hinzugefügt.',
    UNALLOCATED_AREA: '(Nicht vermietete Flächen)',
    FILE_IMPORT_SUCCESS: 'Daten erfolgreich importiert!',
    FILE_IMPORT_INVALID_JSON: 'Ungültige Datenstruktur in der JSON-Datei.',
    FILE_IMPORT_ERROR: (message) => `Fehler beim Parsen der JSON-Datei: ${message}`,
    FILE_READ_ERROR: 'Fehler beim Lesen der Datei.',
    FILE_TYPE_ERROR: 'Bitte nur JSON-Dateien auswählen!',
    NO_FILE_SELECTED: 'Keine Datei ausgewählt',

    // Add new cookie-related messages
    SESSION_SAVE_SUCCESS: 'Daten erfolgreich in Session gespeichert.',
    SESSION_LOAD_SUCCESS: 'Daten erfolgreich aus Session geladen.',
    SESSION_LOAD_ERROR: 'Fehler beim Laden der Sessiondaten.',
    SESSION_CLEAR_SUCCESS: 'Sessiondaten erfolgreich gelöscht.'
};

export const DEFAULT_TENANT_SELECT_VALUE = '-1';
export const UNKNOWN_TENANT_NAME = 'Unbekannter Mieter';
export const YES_TEXT = 'Ja';
export const NO_TEXT = 'Nein';
export const TENANT_GROUP_1_CLASS = 'tenant-group-1';
export const TENANT_GROUP_2_CLASS = 'tenant-group-2';
export const NEW_TENANT_ROW_CLASS = 'new-tenant-row';
export const NO_TENANTS_MESSAGE_CLASS = 'no-tenants-message';
export const NEW_ROOM_ROW_CLASS = 'new-room-row';
export const NO_ROOMS_MESSAGE_CLASS = 'no-rooms-message';
export const UNALLOCATED_ROW_CLASS = 'unallocated-row';