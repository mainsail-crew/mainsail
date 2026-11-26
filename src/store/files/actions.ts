import Vue from 'vue'
import { ActionTree } from 'vuex'
import i18n from '@/plugins/i18n'
import { escapePath } from '@/plugins/helpers'
import { RootState } from '@/store/types'
import { FileRolloverApplication, FileState, FileStateDirectory, FileUploadItem } from '@/store/files/types'
import { themeDir } from '@/store/variables'
import {
    CONFIG_ROOT,
    GCODES_ROOT,
    LOGS_ROOT,
    ROLLOVER_RELOAD_DELAY,
    THEME_DIR,
    getErrorMessage,
    getRoot,
    isGcodeFile,
    isInPath,
    joinPath,
    logDebug,
    logError,
    normalizePath,
    parseDirectoryResponse,
    splitPath,
    stripRoot,
    toastError,
    uploadFile,
    uploadRequests,
} from '@/store/files/helpers'
import { isJsonRpcError } from '@/types/moonraker'
import type {
    FileDirectoryResponse,
    FileListChangedNotification,
    GcodeMetadata,
} from '@/types/moonraker/FileManagerRPC'

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
    async loadDirectory({ commit, dispatch }, path: string): Promise<FileStateDirectory | null> {
        const normalized = normalizePath(path)

        try {
            const response = await Vue.$socket.emitAndWait('server.files.get_directory', {
                path: normalized,
                extended: getRoot(normalized) === GCODES_ROOT,
            })

            return await dispatch('storeDirectory', { path: normalized, response })
        } catch (error) {
            logError(`cannot load directory ${normalized}:`, getErrorMessage(error))

            // Moonraker rejects directories that don't exist (anymore)
            if (isJsonRpcError(error)) commit('removeDirectoryTree', normalized)
            return null
        }
    },

    /** Stores a loaded directory and removes everything inside of it that doesn't exist anymore. */
    storeDirectory({ state, commit }, payload: { path: string; response: FileDirectoryResponse }): FileStateDirectory {
        const { path, response } = payload
        const { directory, metadata } = parseDirectoryResponse(path, response)

        const removedDirs = Object.keys(state.directories[path]?.dirs ?? {})
            .filter((name) => !(name in directory.dirs))
            .map((name) => joinPath(path, name))
        removedDirs.forEach((dirPath) => commit('removeDirectoryTree', dirPath))

        if (getRoot(path) === GCODES_ROOT) {
            const relativePath = stripRoot(path)
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
    },

    /** Loads a directory and all its subdirectories. */
    async loadDirectoryTree({ dispatch }, path: string): Promise<void> {
        const directory: FileStateDirectory | null = await dispatch('loadDirectory', path)
        if (!directory) return

        await Promise.all(
            Object.keys(directory.dirs).map((name) => dispatch('loadDirectoryTree', joinPath(path, name)))
        )
    },

    async onFilelistChanged({ commit, dispatch }, payload: FileListChangedNotification): Promise<void> {
        const { item, source_item } = payload
        const path = joinPath(item.root, item.path)
        const isGcodesRoot = item.root === GCODES_ROOT

        switch (payload.action) {
            case 'create_file':
            case 'modify_file':
                commit('setDirectoryEntry', { path, type: 'files', item })
                if (isGcodesRoot && isGcodeFile(item.path)) await dispatch('fetchMetadata', item.path)
                break

            case 'delete_file':
                commit('removeDirectoryEntry', { path, type: 'files' })
                if (isGcodesRoot) commit('removeMetadata', item.path)
                break

            case 'move_file':
                if (source_item) {
                    commit('removeDirectoryEntry', {
                        path: joinPath(source_item.root, source_item.path),
                        type: 'files',
                    })
                    if (source_item.root === GCODES_ROOT) commit('removeMetadata', source_item.path)
                }

                commit('setDirectoryEntry', { path, type: 'files', item })
                // thumbnail paths are relative to the gcode file, so the metadata has to be loaded again
                if (isGcodesRoot && isGcodeFile(item.path)) await dispatch('fetchMetadata', item.path)
                break

            case 'create_dir':
                commit('setDirectoryEntry', { path, type: 'dirs', item })
                // a copied directory already contains files
                if (isGcodesRoot) await dispatch('loadDirectoryTree', path)
                else if (path === THEME_DIR) await dispatch('loadDirectory', THEME_DIR)
                break

            case 'delete_dir':
                commit('removeDirectoryEntry', { path, type: 'dirs' })
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

    async onDirectoryMoved({ state, commit, dispatch }, payload: FileListChangedNotification): Promise<void> {
        const { item, source_item } = payload
        if (!source_item) return

        const source = joinPath(source_item.root, source_item.path)
        const dest = joinPath(item.root, item.path)
        const wasLoaded = source in state.directories

        commit('removeDirectoryEntry', { path: source, type: 'dirs' })
        commit('setDirectoryEntry', { path: dest, type: 'dirs', item })
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
        else if (dest === THEME_DIR && !wasLoaded) await dispatch('loadDirectory', THEME_DIR)
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
    async fetchMetadata({ dispatch }, filename: string): Promise<GcodeMetadata | null> {
        try {
            const metadata = await Vue.$socket.emitAndWait('server.files.metadata', { filename })
            await dispatch('storeMetadata', metadata)

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
    async scanMetadata({ dispatch }, filename: string): Promise<void> {
        try {
            const metadata = await Vue.$socket.emitAndWait('server.files.metascan', { filename })
            await dispatch('storeMetadata', metadata)

            Vue.$toast.success(i18n.t('Files.ScanMetaSuccess', { filename }).toString())
        } catch (error) {
            toastError(error)
        }
    },

    /** Stores metadata and updates the current print file, if it is the printed file. */
    storeMetadata({ commit, rootState }, metadata: GcodeMetadata): void {
        commit('setMetadata', [metadata])

        if (metadata.filename !== rootState.printer?.print_stats?.filename) return
        commit('printer/clearCurrentFile', null, { root: true })
        commit('printer/setData', { current_file: { ...metadata } }, { root: true })
    },

    /** @param path path of the new directory, starting with the root */
    async createDirectory(_, path: string): Promise<boolean> {
        const normalized = normalizePath(path)

        try {
            await Vue.$socket.emitAndWait('server.files.post_directory', { path: normalized })
            Vue.$toast.success(i18n.t('Files.SuccessfullyCreated', { filename: splitPath(normalized).name }).toString())

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
            Vue.$toast.success(i18n.t('Files.SuccessfullyDeleted', { filename: splitPath(normalized).name }).toString())

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
            if (payload.silent) return true

            Vue.$toast.success(i18n.t('Files.SuccessfullyDeleted', { filename: splitPath(normalized).name }).toString())

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

            const filename = splitPath(dest).name
            const isRename = splitPath(source).dir === splitPath(dest).dir
            const message = isRename
                ? i18n.t('Files.SuccessfullyRenamed', { filename })
                : i18n.t('Files.SuccessfullyMoved', { filename })
            Vue.$toast.success(message.toString())

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

                if (filename !== null) Vue.$toast.success(i18n.t('Files.SuccessfullyUploaded', { filename }).toString())
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

    async rolloverLogs({ dispatch, getters }, applications: FileRolloverApplication[]): Promise<void> {
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
