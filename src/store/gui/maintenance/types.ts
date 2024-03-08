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
    start_filament: number
    start_printtime: number
    end_time: number | null

    reminder: {
        bool: boolean
        repeat: boolean

        filament: {
            bool: boolean
            trigger: number | null
            end: number | null
        }

        printtime: {
            bool: boolean
            trigger: number | null
            end: number | null
        }

        date: {
            bool: boolean
            trigger: number | null
        }
    }
}
