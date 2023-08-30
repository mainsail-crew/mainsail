export interface ServerSpoolmanState {
    info: {
        automatic_backups: boolean
        backups_dir: string
        data_dir: string
        debug_mode: boolean
        version: string
    }
    spool_id: number | null
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
}
