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
     * Paths are relative to the root. The gcodes root only returns files
     * with a valid gcode extension.
     */
    'server.files.list': (params?: {
        /** The root to list (default: 'gcodes') */
        root?: string
    }) => Promise<FileListItem[]>

    /**
     * Lists all roots registered with Moonraker.
     */
    'server.files.roots': () => Promise<FileRootInfo[]>

    /**
     * Returns the metadata of a gcode file. Moonraker returns an error
     * if the file doesn't exist or no metadata is available.
     */
    'server.files.metadata': (params: {
        /** Path to the gcode file, relative to the gcodes root */
        filename: string
    }) => Promise<GcodeMetadata>

    /**
     * Scans the metadata of a gcode file. If the file was already scanned,
     * the scan is forced again.
     */
    'server.files.metascan': (params: {
        /** Path to the gcode file, relative to the gcodes root */
        filename: string
    }) => Promise<GcodeMetadata>

    /**
     * Returns the thumbnails of a gcode file.
     */
    'server.files.thumbnails': (params: {
        /** Path to the gcode file, relative to the gcodes root */
        filename: string
    }) => Promise<GcodeThumbnailDetails[]>

    /**
     * Lists the files and subdirectories of a directory. Unlike server.files.list,
     * this doesn't walk through subdirectories and returns all files, also files
     * in the gcodes root without a valid gcode extension.
     */
    'server.files.get_directory': (params?: {
        /** Path to the directory, starting with a registered root (default: 'gcodes') */
        path?: string
        /** Include the metadata of gcode files in the response (default: false) */
        extended?: boolean
    }) => Promise<FileDirectoryResponse>

    /**
     * Creates a directory. The parent directory must exist.
     */
    'server.files.post_directory': (params: {
        /** Path to the new directory, starting with the root */
        path: string
    }) => Promise<FileActionResponse<'create_dir'>>

    /**
     * Deletes a directory.
     */
    'server.files.delete_directory': (params: {
        /** Path to the directory, starting with the root */
        path: string
        /** Delete the directory with all its content. Otherwise, the directory must be empty (default: false) */
        force?: boolean
    }) => Promise<FileActionResponse<'delete_dir'>>

    /**
     * Moves or renames a file or directory. Renaming a directory to an existing
     * directory moves it into the existing one, renaming a file to an existing
     * file overwrites it.
     */
    'server.files.move': (params: {
        /** Source path, starting with the root */
        source: string
        /** Destination path, starting with the root ('gcodes' or 'config') */
        dest: string
    }) => Promise<FileMoveResponse>

    /**
     * Copies a file or directory.
     */
    'server.files.copy': (params: {
        /** Source path, starting with the root */
        source: string
        /** Destination path, starting with the root ('gcodes' or 'config') */
        dest: string
    }) => Promise<FileActionResponse<'create_file' | 'modify_file' | 'create_dir'>>

    /**
     * Creates a zip archive of files and directories.
     */
    'server.files.zip': (params: {
        /** Paths of the files and directories to archive, each starting with a root */
        items: string[]
        /** Path of the archive, starting with a writable root (default: 'config/collection-{timestamp}.zip') */
        dest?: string
        /** Store the files without compression (default: false) */
        store_only?: boolean
    }) => Promise<FileZipResponse>

    /**
     * Deletes a file.
     */
    'server.files.delete_file': (params: {
        /** Path to the file, starting with the root */
        path: string
    }) => Promise<FileActionResponse<'delete_file'>>
}

/**
 * Permissions of a file, directory or root: '' (no access), 'r' (read-only) or 'rw' (read and write).
 */
export type FilePermission = '' | 'r' | 'rw'

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
    /** Permissions of the file */
    permissions: FilePermission
}

/**
 * Root entry returned by server.files.roots.
 */
export interface FileRootInfo {
    /** Name of the root */
    name: string
    /** Absolute path of the root on the host */
    path: string
    /** Permissions of the root */
    permissions: FilePermission
}

/**
 * Disk usage of the storage of a directory.
 */
export interface FileDiskUsage {
    /** Total capacity in bytes */
    total: number
    /** Used space in bytes */
    used: number
    /** Free space in bytes */
    free: number
}

/**
 * Directory entry returned by server.files.get_directory.
 */
export interface FileDirectoryInfo {
    /** Name of the directory */
    dirname: string
    /** Last modified date as a unix timestamp */
    modified: number
    /** Size of the directory in bytes */
    size: number
    /** Permissions of the directory */
    permissions: FilePermission
}

/**
 * File entry returned by server.files.get_directory. With `extended: true`, gcode files
 * also contain their metadata. The `filename` is always the name, not the path.
 */
export interface FileDirectoryFileInfo extends Partial<Omit<GcodeMetadata, 'filename' | 'modified' | 'size'>> {
    /** Name of the file */
    filename: string
    /** Last modified date as a unix timestamp */
    modified: number
    /** Size of the file in bytes */
    size: number
    /** Permissions of the file */
    permissions: FilePermission
}

/**
 * Response of server.files.get_directory.
 */
export interface FileDirectoryResponse {
    /** Subdirectories of the directory */
    dirs: FileDirectoryInfo[]
    /** Files in the directory */
    files: FileDirectoryFileInfo[]
    /** Disk usage of the storage of the directory */
    disk_usage: FileDiskUsage
    /** Name and permissions of the root of the directory */
    root_info: {
        name: string
        permissions: FilePermission
    }
}

/**
 * File or directory affected by a file manager action.
 */
export interface FileItem {
    /** Root of the item */
    root: string
    /** Path of the item, relative to the root */
    path: string
    /** Last modified date as a unix timestamp (0 if the item was deleted) */
    modified: number
    /** Size of the item in bytes (0 if the item was deleted) */
    size: number
    /** Permissions of the item ('' if the item was deleted) */
    permissions: FilePermission
}

/**
 * Source of a moved file or directory.
 */
export interface FileSourceItem {
    /** Root of the source item */
    root: string
    /** Path of the source item, relative to the root */
    path: string
}

/**
 * Action of a file manager change, also used in the notify_filelist_changed notification.
 */
export type FileAction =
    | 'create_file'
    | 'create_dir'
    | 'delete_file'
    | 'delete_dir'
    | 'move_file'
    | 'move_dir'
    | 'modify_file'
    | 'root_update'

/**
 * Response of file manager actions with a single affected item.
 */
export interface FileActionResponse<A extends FileAction> {
    /** The affected file or directory */
    item: FileItem
    /** The action Moonraker took */
    action: A
}

/**
 * Response of server.files.move.
 */
export interface FileMoveResponse extends FileActionResponse<'move_file' | 'move_dir'> {
    /** The moved file or directory before the move */
    source_item: FileSourceItem
}

/**
 * Response of server.files.zip.
 */
export interface FileZipResponse {
    /** The created archive */
    destination: FileItem
    /** The action Moonraker took */
    action: 'zip_files'
}

/**
 * Response of the HTTP upload endpoint (POST /server/files/upload).
 */
export interface FileUploadResponse {
    /** The uploaded file */
    item: FileItem
    /** The upload started a print */
    print_started: boolean
    /** The upload was added to the job queue */
    print_queued: boolean
    /** The action Moonraker took */
    action: 'create_file'
}

/**
 * Payload of the notify_filelist_changed notification.
 * @see https://moonraker.readthedocs.io/en/latest/external_api/jsonrpc_notifications/#file-list-changed
 */
export interface FileListChangedNotification {
    /** The action that caused the notification */
    action: FileAction
    /** The changed file or directory */
    item: FileItem
    /** The source of a moved file or directory, only for move_file and move_dir */
    source_item?: FileSourceItem
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
 * Thumbnail entry returned by server.files.thumbnails.
 */
export interface GcodeThumbnailDetails extends Omit<GcodeThumbnail, 'relative_path'> {
    /** Path of the thumbnail, relative to the gcodes root */
    thumbnail_path: string
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
    /** Unique identifier of the metadata */
    uuid?: string
    /** File processors that processed and modified the file (e.g. 'preprocess_cancellation') */
    file_processors?: string[]
    /** Name of the slicer */
    slicer?: string
    /** Version of the slicer */
    slicer_version?: string
    /** Byte position of the first gcode command */
    gcode_start_byte?: number
    /** Byte position after the last gcode command */
    gcode_end_byte?: number
    /** Height of the highest object in mm */
    object_height?: number
    /** Estimated print time in seconds */
    estimated_time?: number
    /** Nozzle diameter in mm */
    nozzle_diameter?: number
    /** Layer height in mm */
    layer_height?: number
    /** Height of the first layer in mm */
    first_layer_height?: number
    /** Extruder temperature of the first layer in °C */
    first_layer_extr_temp?: number
    /** Bed temperature of the first layer in °C */
    first_layer_bed_temp?: number
    /** Chamber temperature in °C */
    chamber_temp?: number
    /** Name(s) of the filaments */
    filament_name?: string
    /** Filament colors in #RRGGBB format */
    filament_colors?: string[]
    /** Extruder colors defined in the slicer */
    extruder_colors?: string[]
    /** Base temperatures of the filaments in °C */
    filament_temps?: number[]
    /** Type(s) of the filaments, e.g. 'PLA' */
    filament_type?: string
    /** Total filament length in mm */
    filament_total?: number
    /** Number of filament changes */
    filament_change_count?: number
    /** Total filament weight in g */
    filament_weight_total?: number
    /** Filament weight per tool in g */
    filament_weights?: number[]
    /** Vendor of the printer profile */
    printer_vendor?: string
    /** Model of the printer profile */
    printer_model?: string
    /** Variant of the printer profile */
    printer_variant?: string
    /** Version of the slicer profile */
    profile_version?: string
    /** Identifies a multi-material print with a single extruder */
    mmu_print?: number
    /** Tool numbers used in the print */
    referenced_tools?: number[]
    /** Thumbnails embedded in the gcode file */
    thumbnails?: GcodeThumbnail[]
    /** History job id of the last print, null if the file was never printed */
    job_id?: string | null
    /** Unix timestamp of the last print start, null if the file was never printed */
    print_start_time?: number | null
}
