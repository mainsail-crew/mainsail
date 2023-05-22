export interface GuiMaintenanceState {
    entries: {
        [key: string]: GuiMaintenanceStateEntry
    }
}

export interface GuiMaintenanceStateEntry {
    id?: string
    name: string
    note: string
    start_time: number
    end_time: number | null

    reminder: boolean
    reminderRepeat: boolean

    reminderFilament: boolean
    reminderFilamentStart: number
    reminderFilamentTrigger: number | null
    reminderFilamentEnd: number | null

    reminderPrinttime: boolean
    reminderPrinttimeStart: number | null
    reminderPrinttimeTrigger: number | null
    reminderPrinttimeEnd: number | null

    reminderDate: boolean
    reminderDateTrigger: number | null
}
