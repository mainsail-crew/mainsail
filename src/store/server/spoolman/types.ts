export interface ServerSpoolmanState {
    health: string
    info: {
        automatic_backups: boolean
        backups_dir: string
        data_dir: string
        debug_mode: boolean
        version: string
    }
    active_spool_id: number | null
    active_spool: ServerSpoolmanStateSpool | null
    vendors: ServerSpoolmanStateVendor[]
    feeds: string[]
}

export interface ServerSpoolmanStateVendor {
    id: number
    registered: string
    name: string
}

export interface ServerSpoolmanStateFilament {
    id: number
    registered: string
    name: string
    comment?: string
    color_hex: string
    density: number
    diameter: number
    material: string
    price: number
    settings_bed_temp: number
    settings_extruder_temp: number
    spool_weight: number
    weight: number
    vendor: ServerSpoolmanStateVendor
}

export interface ServerSpoolmanStateSpool {
    id: number
    registered: string
    archived: boolean
    filament: ServerSpoolmanStateFilament
    first_used: string
    last_used: string
    remaining_length: number
    remaining_weight: number
    used_length: number
    used_weight: number
    location?: string
    comment?: string
}
