export interface FileState {
    filetree: FileStateFile[]
}

export interface FileStateFile {
    isDirectory: boolean
    filename: string
    modified: Date
    permissions: string
    childrens?: FileStateFile[]
    disk_usage?: FileStateDiskUsage
    print_start_time?: Date | null
    job_id?: string | null
    estimated_time?: number
    filament_total?: number
    filament_weight_total?: number
    first_layer_height?: number
    first_layer_bed_temp?: number
    first_layer_extr_temp?: number
    gcode_start_byte?: number
    gcode_end_byte?: number
    layer_height?: number
    object_height?: number
    slicer?: string
    slicer_version?: string
    thumbnails?: FileStateFileThumbnail[]
    metadataPulled?: boolean,
    metadataRequested?: boolean,
    size?: number
}

export interface FileStateDiskUsage {
    free: number
    total: number
    used: number
}

export interface FileStateRootInfo {
    name: string
    permissions: string
}

export interface FileStateFileThumbnail {
    width: number
    height: number
    size: number
    relative_path: string
}

export interface ApiGetDirectoryReturn {
    dirs: ApiGetDirectoryReturnDir[]
    files: ApiGetDirectoryReturnFile[]
    disk_usage: FileStateDiskUsage
    root_info?: FileStateRootInfo
    // eslint-disable-next-line
    requestParams?: any
}

export interface ApiGetDirectoryReturnDir {
    modified: number
    size: number
    dirname: string
    permissions: string
}

export interface ApiGetDirectoryReturnFile {
    modified: number
    size: number
    filename: string
    permissions: string
}