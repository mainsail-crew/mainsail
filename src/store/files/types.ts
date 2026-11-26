import type { FileDiskUsage, FilePermission, GcodeMetadata } from '@/types/moonraker/FileManagerRPC'

export interface FileState {
    /** Permissions of the registered roots, keyed by the root name */
    roots: Record<string, FilePermission>
    /** Loaded directories, keyed by their normalized path including the root, e.g. 'gcodes/subdir' */
    directories: Record<string, FileStateDirectory>
    /** Metadata of gcode files, keyed by the path relative to the gcodes root, e.g. 'subdir/file.gcode' */
    metadata: Record<string, GcodeMetadata>
    upload: FileStateUpload
}

/**
 * Content of a loaded directory. Directory objects are frozen and replaced on every change,
 * so Vue doesn't need to observe every single entry.
 */
export interface FileStateDirectory {
    /** Subdirectories, keyed by their name */
    dirs: Readonly<Record<string, FileStateEntry>>
    /** Files, keyed by their name */
    files: Readonly<Record<string, FileStateEntry>>
    /** Disk usage of the storage of the directory */
    disk_usage: FileDiskUsage | null
}

export interface FileStateEntry {
    name: string
    /** Last modified date as a unix timestamp in seconds */
    modified: number
    size: number
    permissions: FilePermission
}

export interface FileStateUpload {
    show: boolean
    filename: string
    currentNumber: number
    maxNumber: number
    percent: number
    speed: number
}

export interface FileUploadItem {
    file: File
    root: 'gcodes' | 'config'
    /** Directory relative to the root */
    path: string
}

/**
 * File or directory of a directory listing, as used by the file browsers.
 */
export interface FileStateFile {
    isDirectory: boolean
    filename: string
    modified: Date
    size: number
    permissions: FilePermission
}

/**
 * Directory listing returned by the getDirectory getter.
 */
export interface FileStateDirectoryListing {
    path: string
    permissions: FilePermission
    disk_usage: FileDiskUsage | null
    items: FileStateFile[]
}

/**
 * Gcode file (or directory in the gcodes root) with its metadata and print history.
 */
export interface FileStateGcodefile
    extends FileStateFile, Partial<Omit<GcodeMetadata, 'filename' | 'modified' | 'size'>> {
    /** Path relative to the gcodes root */
    full_filename: string
    hasMetadata: boolean
    preheat_gcode: string | null
    count_printed: number
    last_status: string | null
    last_start_time: Date | null
    last_end_time: Date | null
    last_filament_used: number | null
    last_print_duration: number | null
    last_total_duration: number | null
}

export interface FileStateGcodefileFilament {
    color: string
    name: string
    type: string
    weight: number
}

export interface ConfigFileKey {
    name: string
    type: string
    line: number
}

export interface ConfigFileSection extends ConfigFileKey {
    children: ConfigFileKey[]
}
