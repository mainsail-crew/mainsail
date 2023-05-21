export interface GuiMaintenanceState {
    entries: {
        [key: string]: GuiMaintenanceStateEntry
    }
}

export interface GuiMaintenanceStateEntry {
    id: string
    name: string
    note: string
    reminder: boolean
    reminderRepeat: boolean
    reminderFilament: boolean
    reminderFilamentValue: number | null
    reminderPrinttime: boolean
    reminderPrinttimeValue: number | null
    reminderDate: boolean
    reminderDateValue: number | null
}
