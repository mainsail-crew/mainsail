import Vue from 'vue'
import { ActionContext, ActionTree } from 'vuex'
import axios from 'axios'
import i18n from '@/plugins/i18n'
import { escapePath } from '@/plugins/helpers'
import { RootState } from '@/store/types'
import { FileState, FileStateDirectory, FileStateEntry, FileStateUpload, FileUploadItem } from '@/store/files/types'
import { hiddenDirectories, themeDir, validGcodeExtensions } from '@/store/variables'
import { getExtension, getRoot, isInPath, joinPath, normalizePath, splitPath, stripRoot } from '@/store/files/paths'
import { RequestTracker } from '@/store/editor/requestTracker'
import { isJsonRpcError } from '@/types/moonraker'
import type {
    FileDirectoryResponse,
    FileListChangedNotification,
    FilePermission,
    FileUploadResponse,
    GcodeMetadata,
} from '@/types/moonraker/FileManagerRPC'

const LOG_PREFIX = '[Files]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

const GCODES_ROOT = 'gcodes'
const CONFIG_ROOT = 'config'
const LOGS_ROOT = 'logs'
const THEME_DIR = joinPath(CONFIG_ROOT, themeDir)
/** Delay before the logs root is reloaded after a rollover, so the new files exist. */
const ROLLOVER_RELOAD_DELAY = 500
/** File info fields, every other field of an extended get_directory file entry is metadata. */
const FILE_INFO_FIELDS = ['filename', 'modified', 'size', 'permissions']

type FilesContext = ActionContext<FileState, RootState>
type EntryType = 'dirs' | 'files'

const uploadRequests = new RequestTracker<'upload'>()

const isGcodeFile = (filename: string): boolean => validGcodeExtensions.includes(getExtension(filename))

const getErrorMessage = (error: unknown): string => {
    if (isJsonRpcError(error) || error instanceof Error) return error.message

    return String(error)
}

const toastError = (error: unknown): void => {
    Vue.$toast.error(getErrorMessage(error))
}

const toastSuccess = (key: string, filename: string): void => {
    Vue.$toast.success(i18n.t(key, { filename }).toString())
}

const toEntry = (
    name: string,
    item: { modified: number; size: number; permissions: FilePermission }
): FileStateEntry => ({ name, modified: item.modified, size: item.size, permissions: item.permissions })

/** Converts a get_directory response into a directory and the metadata of its gcode files. */
const parseDirectoryResponse = (path: string, response: FileDirectoryResponse) => {
    const isGcodesRoot = getRoot(path) === GCODES_ROOT
    const directory: FileStateDirectory = { dirs: {}, files: {}, disk_usage: response.disk_usage }
    const metadata: GcodeMetadata[] = []

    const dirs: Record<string, FileStateEntry> = {}
    response.dirs
        .filter((dir) => !hiddenDirectories.includes(dir.dirname))
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

    return { directory: { ...directory, dirs, files }, metadata }
}

/** Stores a loaded directory and removes everything that doesn't exist anymore. */
const applyDirectory = (
    { state, commit }: FilesContext,
    path: string,
    response: FileDirectoryResponse
): FileStateDirectory => {
    const { directory, metadata } = parseDirectoryResponse(path, response)
    const isGcodesRoot = getRoot(path) === GCODES_ROOT
    const relativePath = stripRoot(path)

    const removedDirs = Object.keys(state.directories[path]?.dirs ?? {})
        .filter((name) => !(name in directory.dirs))
        .map((name) => joinPath(path, name))
    removedDirs.forEach((dirPath) => commit('removeDirectoryTree', dirPath))

    if (isGcodesRoot) {
        const loadedMetadata = metadata.map((entry) => entry.filename)
        const staleMetadata = Object.keys(state.metadata).filter(
            (key) => splitPath(key).dir === relativePath && !loadedMetadata.includes(key)
        )

        commit('removeMetadata', [...removedDirs.map(stripRoot), ...staleMetadata])
        commit('setMetadata', metadata)
    }

    commit('setDirectory', { path, directory })
    commit('setRootPermissions', { root: response.root_info.name, permissions: response.root_info.permissions })

    return directory
}

const setEntry = (
    { commit }: FilesContext,
    path: string,
    type: EntryType,
    item: { modified: number; size: number; permissions: FilePermission }
): void => {
    const { dir, name } = splitPath(path)
    if (type === 'dirs' && hiddenDirectories.includes(name)) return

    commit('setDirectoryEntry', { path: dir, type, entry: toEntry(name, item) })
}

const removeEntry = ({ commit }: FilesContext, path: string, type: EntryType): void => {
    const { dir, name } = splitPath(path)

    commit('removeDirectoryEntry', { path: dir, type, name })
}

/** Stores metadata and updates the current print file, if it is the printed file. */
const storeMetadata = ({ commit, rootState }: FilesContext, metadata: GcodeMetadata): void => {
    commit('setMetadata', [metadata])

    if (metadata.filename !== rootState.printer?.print_stats?.filename) return
    commit('printer/clearCurrentFile', null, { root: true })
    commit('printer/setData', { current_file: { ...metadata } }, { root: true })
}

/** Uploads a file. Returns the filename on success, or null on failure or cancellation. */
const uploadFile = async (
    apiUrl: string,
    item: FileUploadItem,
    signal: AbortSignal,
    onProgress: (progress: Partial<FileStateUpload>) => void
): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', item.file, item.file.name)
    formData.append('root', item.root)
    formData.append('path', normalizePath(item.path))

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

export const actions: ActionTree<FileState, RootState> = {
    reset({ commit }): void {
        uploadRequests.abort('upload')
        commit('reset')
    },

    /**
     * Loads the config root with the theme files and the complete gcodes root.
     * All other directories are loaded when they are opened.
     */
    async init({ state, dispatch }, registeredDirectories: string[]): Promise<void> {
        // directories that were loaded before a reconnect could have missed changes
        const loadedDirectories = Object.keys(state.directories).filter(
            (path) => !isInPath(path, GCODES_ROOT) && ![CONFIG_ROOT, THEME_DIR].includes(path)
        )

        if (registeredDirectories.includes(CONFIG_ROOT)) await dispatch('loadConfigRoot')

        // the gcodes root can be huge, so it is loaded in the background
        if (registeredDirectories.includes(GCODES_ROOT)) dispatch('loadDirectoryTree', GCODES_ROOT)

        loadedDirectories.forEach((path) => dispatch('loadDirectory', path))
    },

    async loadConfigRoot({ dispatch }): Promise<void> {
        const config: FileStateDirectory | null = await dispatch('loadDirectory', CONFIG_ROOT)
        if (config && themeDir in config.dirs) await dispatch('loadDirectory', THEME_DIR)
    },

    /**
     * Loads a directory. Gcode files also get their metadata.
     * Returns null if the directory cannot be loaded.
     */
    async loadDirectory(context, path: string): Promise<FileStateDirectory | null> {
        const normalized = normalizePath(path)

        try {
            const response = await Vue.$socket.emitAndWait('server.files.get_directory', {
                path: normalized,
                extended: getRoot(normalized) === GCODES_ROOT,
            })

            return applyDirectory(context, normalized, response)
        } catch (error) {
            logError(`cannot load directory ${normalized}:`, getErrorMessage(error))
            return null
        }
    },

    /** Loads a directory and all its subdirectories. */
    async loadDirectoryTree({ dispatch }, path: string): Promise<void> {
        const directory: FileStateDirectory | null = await dispatch('loadDirectory', path)
        if (!directory) return

        await Promise.all(
            Object.keys(directory.dirs).map((name) => dispatch('loadDirectoryTree', joinPath(path, name)))
        )
    },

    async onFilelistChanged(context, payload: FileListChangedNotification): Promise<void> {
        const { item, source_item } = payload
        const path = joinPath(item.root, item.path)
        const isGcodesRoot = item.root === GCODES_ROOT
        const { commit, dispatch } = context

        switch (payload.action) {
            case 'create_file':
            case 'modify_file':
                setEntry(context, path, 'files', item)
                if (isGcodesRoot && isGcodeFile(item.path)) await dispatch('fetchMetadata', item.path)
                break

            case 'delete_file':
                removeEntry(context, path, 'files')
                if (isGcodesRoot) commit('removeMetadata', item.path)
                break

            case 'move_file':
                if (source_item) {
                    removeEntry(context, joinPath(source_item.root, source_item.path), 'files')
                    if (source_item.root === GCODES_ROOT) commit('removeMetadata', source_item.path)
                }

                setEntry(context, path, 'files', item)
                // thumbnail paths are relative to the gcode file, so the metadata has to be loaded again
                if (isGcodesRoot && isGcodeFile(item.path)) await dispatch('fetchMetadata', item.path)
                break

            case 'create_dir':
                setEntry(context, path, 'dirs', item)
                // a copied directory already contains files
                if (isGcodesRoot) await dispatch('loadDirectoryTree', path)
                break

            case 'delete_dir':
                removeEntry(context, path, 'dirs')
                commit('removeDirectoryTree', path)
                if (isGcodesRoot) commit('removeMetadata', item.path)
                break

            case 'move_dir':
                await dispatch('onDirectoryMoved', payload)
                break

            case 'root_update':
                await dispatch('server/addRootDirectory', payload, { root: true })
                await dispatch('onRootUpdated', item.root)
                break

            default:
                logError('unknown filelist_changed action:', payload.action)
        }
    },

    async onDirectoryMoved(context, payload: FileListChangedNotification): Promise<void> {
        const { item, source_item } = payload
        if (!source_item) return

        const { state, commit, dispatch } = context
        const source = joinPath(source_item.root, source_item.path)
        const dest = joinPath(item.root, item.path)
        const wasLoaded = source in state.directories

        removeEntry(context, source, 'dirs')
        setEntry(context, dest, 'dirs', item)
        commit('moveDirectoryTree', { source, dest })

        const isSourceGcodes = source_item.root === GCODES_ROOT
        const isDestGcodes = item.root === GCODES_ROOT
        if (isSourceGcodes && isDestGcodes) {
            // thumbnails are moved with the directory, so the metadata stays valid
            commit('moveMetadata', { source: source_item.path, dest: item.path })
        } else if (isSourceGcodes) {
            commit('removeMetadata', source_item.path)
        }

        if (isDestGcodes && !(isSourceGcodes && wasLoaded)) await dispatch('loadDirectoryTree', dest)
    },

    async onRootUpdated({ commit, dispatch }, root: string): Promise<void> {
        commit('removeDirectoryTree', root)

        if (root === GCODES_ROOT) {
            commit('removeMetadata', '')
            await dispatch('loadDirectoryTree', GCODES_ROOT)
        } else if (root === CONFIG_ROOT) {
            await dispatch('loadConfigRoot')
        }
    },

    /**
     * Loads the metadata of a gcode file. Returns null if Moonraker has no metadata for the file.
     * @param filename path relative to the gcodes root
     */
    async fetchMetadata(context, filename: string): Promise<GcodeMetadata | null> {
        try {
            const metadata = await Vue.$socket.emitAndWait('server.files.metadata', { filename })
            storeMetadata(context, metadata)

            return metadata
        } catch (error) {
            logDebug(`no metadata for ${filename}:`, getErrorMessage(error))
            return null
        }
    },

    /**
     * Forces Moonraker to scan the metadata of a gcode file again.
     * @param filename path relative to the gcodes root
     */
    async scanMetadata(context, filename: string): Promise<void> {
        try {
            const metadata = await Vue.$socket.emitAndWait('server.files.metascan', { filename })
            storeMetadata(context, metadata)

            toastSuccess('Files.ScanMetaSuccess', filename)
        } catch (error) {
            toastError(error)
        }
    },

    /** @param path path of the new directory, starting with the root */
    async createDirectory(_, path: string): Promise<boolean> {
        const normalized = normalizePath(path)

        try {
            await Vue.$socket.emitAndWait('server.files.post_directory', { path: normalized })
            toastSuccess('Files.SuccessfullyCreated', splitPath(normalized).name)

            return true
        } catch (error) {
            toastError(error)
            return false
        }
    },

    /** Deletes a directory with all its content. */
    async deleteDirectory(_, path: string): Promise<boolean> {
        const normalized = normalizePath(path)

        try {
            await Vue.$socket.emitAndWait('server.files.delete_directory', { path: normalized, force: true })
            toastSuccess('Files.SuccessfullyDeleted', splitPath(normalized).name)

            return true
        } catch (error) {
            toastError(error)
            return false
        }
    },

    /** @param payload.silent don't show a toast on success, e.g. for files that are deleted along with others */
    async deleteFile(_, payload: { path: string; silent?: boolean }): Promise<boolean> {
        const normalized = normalizePath(payload.path)

        try {
            await Vue.$socket.emitAndWait('server.files.delete_file', { path: normalized })
            if (!payload.silent) toastSuccess('Files.SuccessfullyDeleted', splitPath(normalized).name)

            return true
        } catch (error) {
            toastError(error)
            return false
        }
    },

    /** Moves or renames a file or directory. */
    async move(_, payload: { source: string; dest: string; silent?: boolean }): Promise<boolean> {
        const source = normalizePath(payload.source)
        const dest = normalizePath(payload.dest)

        try {
            await Vue.$socket.emitAndWait('server.files.move', { source, dest })
            if (payload.silent) return true

            const isRename = splitPath(source).dir === splitPath(dest).dir
            toastSuccess(isRename ? 'Files.SuccessfullyRenamed' : 'Files.SuccessfullyMoved', splitPath(dest).name)

            return true
        } catch (error) {
            toastError(error)
            return false
        }
    },

    async copy(_, payload: { source: string; dest: string }): Promise<boolean> {
        try {
            await Vue.$socket.emitAndWait('server.files.copy', {
                source: normalizePath(payload.source),
                dest: normalizePath(payload.dest),
            })

            return true
        } catch (error) {
            toastError(error)
            return false
        }
    },

    /**
     * Creates a zip archive and downloads it.
     * @param payload.items paths of files and directories, starting with the root
     * @param payload.dest path of the archive, starting with a writable root
     * @param payload.loading name of the loading state while the archive is created
     */
    async downloadZip({ rootGetters }, payload: { items: string[]; dest: string; loading?: string }): Promise<void> {
        try {
            const { destination } = await Vue.$socket.emitAndWait(
                'server.files.zip',
                { items: payload.items.map(normalizePath), dest: normalizePath(payload.dest) },
                { loading: payload.loading }
            )

            window.open(
                `${rootGetters['socket/getUrl']}/server/files/${destination.root}/${escapePath(destination.path)}`
            )
        } catch (error) {
            toastError(error)
        }
    },

    /**
     * Uploads files one after another and shows the progress in the upload snackbar.
     * @param payload.loading name of the loading state while uploading
     */
    async uploadFiles(
        { commit, dispatch, rootGetters },
        payload: { files: FileUploadItem[]; loading?: string }
    ): Promise<void> {
        if (payload.files.length === 0) return

        const controller = uploadRequests.start('upload')
        if (payload.loading) await dispatch('socket/addLoading', { name: payload.loading }, { root: true })
        commit('setUpload', { currentNumber: 0, maxNumber: payload.files.length })

        try {
            for (const [index, item] of payload.files.entries()) {
                if (controller.signal.aborted) break

                commit('setUpload', { show: true, currentNumber: index + 1, filename: item.file.name, percent: 0 })
                const filename = await uploadFile(rootGetters['socket/getUrl'], item, controller.signal, (progress) =>
                    commit('setUpload', progress)
                )

                if (filename !== null) toastSuccess('Files.SuccessfullyUploaded', filename)
            }
        } finally {
            if (uploadRequests.finish('upload', controller)) commit('resetUpload')
            if (payload.loading) await dispatch('socket/removeLoading', { name: payload.loading }, { root: true })
        }
    },

    cancelUpload({ commit }): void {
        uploadRequests.abort('upload')
        commit('resetUpload')
    },

    async rolloverLogs({ dispatch, getters }, applications: ('klipper' | 'moonraker')[]): Promise<void> {
        await Promise.all(
            applications.map(async (application) => {
                try {
                    const result = await Vue.$socket.emitAndWait(
                        'server.logs.rollover',
                        { application },
                        { loading: `rolloverLog_${application}` }
                    )

                    result.rolled_over.forEach((name) => {
                        Vue.$toast.success(i18n.t('Machine.LogfilesPanel.RolloverToastSuccessful', { name }).toString())
                    })
                    Object.entries(result.failed).forEach(([name, message]) => {
                        Vue.$toast.error(
                            i18n.t('Machine.LogfilesPanel.RolloverToastFailed', { name, message }).toString()
                        )
                    })
                } catch (error) {
                    toastError(error)
                }
            })
        )

        // Moonraker doesn't watch the logs root, so the new log files only show up after a reload
        if (!getters['isDirectoryLoaded'](LOGS_ROOT)) return
        setTimeout(() => dispatch('loadDirectory', LOGS_ROOT), ROLLOVER_RELOAD_DELAY)
    },
}
