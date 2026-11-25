/**
 * File Manager RPC Interface
 *
 * These endpoints provide access to the files in Moonraker's registered roots
 * (gcodes, config, logs, ...).
 *
 * @see https://moonraker.readthedocs.io/en/latest/external_api/file_manager/
 */
export interface FileManagerRPC {
    /**
     * Lists all files in a root, including files in subdirectories.
     * Paths are relative to the root.
     */
    'server.files.list': (params?: {
        /** The root to list (default: 'gcodes') */
        root?: string
    }) => Promise<FileListItem[]>

    /**
     * Returns the metadata of a gcode file. Moonraker returns an error
     * if the file doesn't exist or no metadata is available.
     */
    'server.files.metadata': (params: {
        /** Path to the gcode file, relative to the gcodes root */
        filename: string
    }) => Promise<GcodeMetadata>
}

/**
 * File entry returned by server.files.list.
 */
export interface FileListItem {
    /** Path of the file, relative to the root */
    path: string
    /** Last modified date as a unix timestamp */
    modified: number
    /** Size of the file in bytes */
    size: number
    /** Permissions of the file: '', 'r' or 'rw' */
    permissions: string
}

/**
 * Thumbnail entry of a gcode file.
 */
export interface GcodeThumbnail {
    /** Width of the thumbnail in pixels */
    width: number
    /** Height of the thumbnail in pixels */
    height: number
    /** Size of the thumbnail in bytes */
    size: number
    /** Path of the thumbnail, relative to the directory of the gcode file */
    relative_path: string
}

/**
 * Metadata of a gcode file. All fields except `filename`, `modified` and `size`
 * are optional, because they depend on what the slicer wrote into the file.
 */
export interface GcodeMetadata {
    /** Path of the gcode file, relative to the gcodes root */
    filename: string
    /** Last modified date as a unix timestamp */
    modified: number
    /** Size of the file in bytes */
    size: number
    /** Unix timestamp of the last print start */
    print_start_time?: number | null
    /** History job id of the last print */
    job_id?: string | null
    /** Name of the slicer */
    slicer?: string
    /** Version of the slicer */
    slicer_version?: string
    /** Byte position of the first gcode command */
    gcode_start_byte?: number
    /** Byte position after the last gcode command */
    gcode_end_byte?: number
    /** Height of the first layer in mm */
    first_layer_height?: number
    /** Layer height in mm */
    layer_height?: number
    /** Height of the highest object in mm */
    object_height?: number
    /** Total filament length in mm */
    filament_total?: number
    /** Total filament weight in g */
    filament_weight_total?: number
    /** Estimated print time in seconds */
    estimated_time?: number
    /** Thumbnails embedded in the gcode file */
    thumbnails?: GcodeThumbnail[]
    /** Bed temperature of the first layer */
    first_layer_bed_temp?: number
    /** Extruder temperature of the first layer */
    first_layer_extr_temp?: number
    /** Unique identifier of the file */
    uuid?: string
}
