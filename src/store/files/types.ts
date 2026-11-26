import type { FileDiskUsage, FilePermission, GcodeMetadata } from '@/types/moonraker/FileManagerRPC'
import type { ServerHistoryStateJob } from '@/store/server/history/types'

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

/** Subdirectories or files of a directory */
export type FileStateEntryType = 'dirs' | 'files'

/** File info of an entry without its name, e.g. from a Moonraker response */
export type FileStateEntryInfo = Omit<FileStateEntry, 'name'>

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
    /** Root to upload into, Moonraker accepts uploads into 'gcodes' and 'config' */
    root: string
    /** Directory relative to the root */
    path: string
}

/** Applications whose logs can be rolled over */
export type FileRolloverApplication = 'klipper' | 'moonraker'

/** A get_directory response, converted into a directory and the metadata of its gcode files */
export interface FileDirectoryParseResult {
    directory: FileStateDirectory
    metadata: GcodeMetadata[]
}

/** Signature of the server/history/getPrintJobsForGcodes getter. `modified` is in milliseconds. */
export type FilePrintJobsGetter = (
    filename: string,
    modified: number,
    filesize: number,
    uuid: string | null,
    job_id: string | null
) => ServerHistoryStateJob[]

/**
 * Builds a gcode file with metadata and print history.
 * @param entry file or directory entry
 * @param path path of the entry relative to the gcodes root
 * @param isDirectory
 * @param filename name to display, e.g. the name or the path relative to the gcodes root
 */
export type FileGcodefileBuilder = (
    entry: FileStateEntry,
    path: string,
    isDirectory: boolean,
    filename: string
) => FileStateGcodefile

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
