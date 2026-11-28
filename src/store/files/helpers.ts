import Vue from 'vue'
import axios from 'axios'
import type { Commit } from 'vuex'
import i18n from '@/plugins/i18n'
import { splitExtension } from '@/plugins/helpers'
import { hiddenDirectories, themeDir, validGcodeExtensions } from '@/store/variables'
import { isJsonRpcError } from '@/types/moonraker'
import type { RootState } from '@/store/types'
import type {
    FileDirectoryParseResult,
    FileGcodefileBuilder,
    FilePrintJobsGetter,
    FileState,
    FileStateEntry,
    FileStateEntryInfo,
    FileStateFile,
    FileStateGcodefile,
    FileStateUpload,
    FileUploadItem,
} from '@/store/files/types'
import type { FileDirectoryResponse, FileUploadResponse, GcodeMetadata } from '@/types/moonraker/FileManagerRPC'

/*
 * Constants
 */

export const GCODES_ROOT = 'gcodes'
export const CONFIG_ROOT = 'config'
export const LOGS_ROOT = 'logs'

/** Path of the directory with the theme files */
export const THEME_DIR = `${CONFIG_ROOT}/${themeDir}`

/** Accepted file extensions for theme images (logo and backgrounds) */
export const THEME_IMAGE_EXTENSIONS = ['.svg', '.jpg', '.jpeg', '.png', '.gif']

/** Delay before the logs root is reloaded after a rollover, so the new files exist */
export const ROLLOVER_RELOAD_DELAY = 500

/** File info fields, every other field of an extended get_directory file entry is metadata */
const FILE_INFO_FIELDS = ['filename', 'modified', 'size', 'permissions']

/** Metadata fields with the gcode to preheat to their temperature */
const PREHEAT_GCODES = [
    { name: 'first_layer_extr_temp', gcode: 'M104' },
    { name: 'first_layer_bed_temp', gcode: 'M140' },
    { name: 'chamber_temp', gcode: 'M141' },
] as const

/*
 * Logging and toasts
 */

const LOG_PREFIX = '[Files]'
export const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
export const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

export const getErrorMessage = (error: unknown): string => {
    if (isJsonRpcError(error) || error instanceof Error) return error.message

    return String(error)
}

export const toastError = (error: unknown): void => {
    Vue.$toast.error(getErrorMessage(error))
}

/*
 * Paths
 *
 * All paths in the store are normalized: no leading, trailing or double slashes,
 * e.g. 'gcodes/subdir/file.gcode'. The first segment is the root.
 */

export const normalizePath = (path: string): string =>
    path
        .split('/')
        .filter((segment) => segment !== '')
        .join('/')

export const joinPath = (...parts: string[]): string => normalizePath(parts.join('/'))

/** Splits a path into its parent directory and its name, e.g. 'gcodes/a/b.gcode' -> 'gcodes/a' + 'b.gcode' */
export const splitPath = (path: string): { dir: string; name: string } => {
    const normalized = normalizePath(path)
    const pos = normalized.lastIndexOf('/')
    if (pos === -1) return { dir: '', name: normalized }

    return { dir: normalized.slice(0, pos), name: normalized.slice(pos + 1) }
}

export const getRoot = (path: string): string => normalizePath(path).split('/')[0]

/** Returns the path without its root, e.g. 'gcodes/a/b.gcode' -> 'a/b.gcode' */
export const stripRoot = (path: string): string => normalizePath(path).split('/').slice(1).join('/')

/** Checks if a path is the given directory or inside of it. */
export const isInPath = (path: string, directory: string): boolean =>
    path === directory || path.startsWith(directory + '/')

/** Replaces the directory prefix of a path, e.g. ('gcodes/a/b', 'gcodes/a', 'gcodes/c') -> 'gcodes/c/b' */
export const replacePathPrefix = (path: string, source: string, dest: string): string =>
    dest + path.slice(source.length)

/** Returns the lowercase extension including the dot, e.g. 'Benchy.GCODE' -> '.gcode' */
export const getExtension = (filename: string): string => splitExtension(filename).extension.toLowerCase()

export const isGcodeFile = (filename: string): boolean => validGcodeExtensions.includes(getExtension(filename))

export const isHiddenDirectory = (name: string): boolean => hiddenDirectories.includes(name)

/** Checks if a file or one of its parent directories is hidden (starts with a dot), e.g. '.trash/a.gcode' */
export const isHiddenPath = (path: string): boolean =>
    normalizePath(path)
        .split('/')
        .some((segment) => segment.startsWith('.'))

/*
 * Records keyed by path
 */

/** Re-keys all keys inside `source` to `dest`. Existing keys inside `dest` are dropped. */
export const moveKeys = <T>(record: Record<string, T>, source: string, dest: string): Record<string, T> => {
    const output: Record<string, T> = {}

    for (const [key, value] of Object.entries(record)) {
        if (isInPath(key, source)) output[replacePathPrefix(key, source, dest)] = value
        else if (!isInPath(key, dest)) output[key] = value
    }

    return output
}

/** Removes all keys inside `path`. An empty path removes everything. */
export const removeKeys = <T>(record: Record<string, T>, path: string): Record<string, T> => {
    if (path === '') return {}

    return Object.fromEntries(Object.entries(record).filter(([key]) => !isInPath(key, path)))
}

/*
 * Entries and directories
 */

export const toEntry = (name: string, item: FileStateEntryInfo): FileStateEntry => ({
    name,
    modified: item.modified,
    size: item.size,
    permissions: item.permissions,
})

export const toFile = (entry: FileStateEntry, isDirectory: boolean): FileStateFile => ({
    isDirectory,
    filename: entry.name,
    modified: new Date(entry.modified * 1000),
    size: entry.size,
    permissions: entry.permissions,
})

/** Converts a get_directory response into a directory and the metadata of its gcode files. */
export const parseDirectoryResponse = (path: string, response: FileDirectoryResponse): FileDirectoryParseResult => {
    const isGcodesRoot = getRoot(path) === GCODES_ROOT
    const metadata: GcodeMetadata[] = []

    const dirs: Record<string, FileStateEntry> = {}
    response.dirs
        .filter((dir) => !isHiddenDirectory(dir.dirname))
        .forEach((dir) => (dirs[dir.dirname] = toEntry(dir.dirname, dir)))

    const files: Record<string, FileStateEntry> = {}
    response.files.forEach((file) => {
        files[file.filename] = toEntry(file.filename, file)

        // Moonraker only adds the metadata to files it has already scanned
        const hasMetadata = Object.keys(file).some((key) => !FILE_INFO_FIELDS.includes(key))
        if (!isGcodesRoot || !isGcodeFile(file.filename) || !hasMetadata) return

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { permissions, ...fileMetadata } = file
        metadata.push({ ...fileMetadata, filename: joinPath(stripRoot(path), file.filename) })
    })

    return { directory: { dirs, files, disk_usage: response.disk_usage }, metadata }
}

/*
 * Gcode files
 */

/**
 * Returns a function that combines a file of the gcodes root with its metadata and print history.
 * Everything that is the same for all files is calculated once.
 */
export const createGcodeFileBuilder = (
    state: FileState,
    rootState: RootState,
    rootGetters: Record<string, unknown>
): FileGcodefileBuilder => {
    const commands = Object.keys(rootState.printer?.gcode?.commands ?? {})
    const preheatGcodes = PREHEAT_GCODES.filter((obj) => commands.includes(obj.gcode))
    const getPrintJobs = rootGetters['server/history/getJobsForFile'] as FilePrintJobsGetter

    return (entry, path, isDirectory, filename) => {
        const metadata = isDirectory ? undefined : state.metadata[path]
        const file: FileStateGcodefile = {
            ...metadata,
            ...toFile(entry, isDirectory),
            filename,
            full_filename: path,
            hasMetadata: metadata !== undefined,
            preheat_gcode: null,
            count_printed: 0,
            last_status: null,
            last_start_time: null,
            last_end_time: null,
            last_filament_used: null,
            last_print_duration: null,
            last_total_duration: null,
        }
        if (isDirectory) return file

        const preheat = preheatGcodes
            .filter((obj) => (file[obj.name] ?? 0) > 1)
            .map((obj) => `${obj.gcode} S${file[obj.name]}`)
        if (preheat.length) file.preheat_gcode = preheat.join('\n')

        const histories = getPrintJobs({
            modified: Math.round(entry.modified * 1000),
            size: entry.size,
            uuid: metadata?.uuid ?? null,
            job_id: metadata?.job_id ?? null,
        })
        if (histories.length === 0) return file

        const sorted = [...histories].sort((a, b) => b.start_time - a.start_time)
        const completed = sorted.filter((history) => history.status === 'completed')
        const lastHistory = sorted[0]

        file.last_status = lastHistory.status
        file.count_printed = completed.length
        file.last_start_time = new Date(lastHistory.start_time * 1000)

        const lastCompleted = completed[0]
        if (!lastCompleted) return file

        file.last_start_time = new Date(lastCompleted.start_time * 1000)
        file.last_end_time = lastCompleted.end_time ? new Date(lastCompleted.end_time * 1000) : null
        file.last_filament_used = lastCompleted.filament_used
        file.last_print_duration = lastCompleted.print_duration
        file.last_total_duration = lastCompleted.total_duration

        return file
    }
}

/*
 * Uploads
 */

export interface UploadQueue {
    /** Files of the batch. Files of later uploads are appended while the batch is running. */
    items: FileUploadItem[]
    controller: AbortController
    /** Resolves when all files of the batch are uploaded, failed or cancelled */
    done: Promise<void>
}

/** The running upload batch. Kept outside of Vuex, because AbortController is not serializable. */
export const uploadQueue: { current: UploadQueue | null } = { current: null }

/** Cancels the running upload batch, including all files that are not uploaded yet. */
export const abortUploadQueue = (): void => {
    uploadQueue.current?.controller.abort()
    uploadQueue.current = null
}

/** Name of the loading state while files are uploaded into a root */
export const getUploadLoadingName = (root: string): string => `upload_${root}`

/** Form data of the HTTP upload endpoint. @param path directory relative to the root */
export const createUploadFormData = (file: File, root: string, path: string): FormData => {
    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('root', root)
    formData.append('path', normalizePath(path))

    return formData
}

/** Uploads a file. Returns the filename on success, or null on failure or cancellation. */
export const uploadFile = async (
    apiUrl: string,
    item: FileUploadItem,
    signal: AbortSignal,
    onProgress: (progress: Partial<FileStateUpload>) => void
): Promise<string | null> => {
    const formData = createUploadFormData(item.file, item.root, item.path)

    try {
        const response = await axios.post<FileUploadResponse>(`${apiUrl}/server/files/upload`, formData, {
            signal,
            onUploadProgress: (event) => onProgress({ percent: (event.progress ?? 0) * 100, speed: event.rate ?? 0 }),
        })

        return splitPath(response.data.item.path).name
    } catch (error) {
        if (axios.isCancel(error)) return null

        logError(`cannot upload ${item.file.name}:`, error)
        Vue.$toast.error(i18n.t('FullscreenUpload.CannotUploadFile').toString())
        return null
    }
}

/** Uploads the files of an upload batch, including files that are appended while it is running. */
export const runUploadQueue = async (queue: UploadQueue, apiUrl: string, commit: Commit): Promise<void> => {
    commit('setUpload', { currentNumber: 0, maxNumber: queue.items.length })

    try {
        // the length is read in every iteration, so appended files are uploaded too
        for (let index = 0; index < queue.items.length; index++) {
            if (queue.controller.signal.aborted) break

            const item = queue.items[index]
            commit('setUpload', { show: true, currentNumber: index + 1, filename: item.file.name, percent: 0 })
            const filename = await uploadFile(apiUrl, item, queue.controller.signal, (progress) =>
                commit('setUpload', progress)
            )

            if (filename !== null) Vue.$toast.success(i18n.t('Files.SuccessfullyUploaded', { filename }).toString())
        }
    } finally {
        // after a cancel, a new batch could already be running
        if (uploadQueue.current === queue) {
            uploadQueue.current = null
            commit('resetUpload')
        }
    }
}
