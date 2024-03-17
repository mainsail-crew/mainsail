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
    start_filament: number
    end_filament: number | null
    start_printtime: number
    end_printtime: number | null

    reminder: {
        type: null | 'one-time' | 'repeat'

        filament: {
            bool: boolean
            value: number | null
        }

        printtime: {
            bool: boolean
            value: number | null
        }

        date: {
            bool: boolean
            value: number | null
        }
    }
}
