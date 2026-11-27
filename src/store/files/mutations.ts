import Vue from 'vue'
import { MutationTree } from 'vuex'
import { getDefaultState, getDefaultUpload } from '@/store/files/index'
import {
    FileState,
    FileStateDirectory,
    FileStateEntryInfo,
    FileStateEntryType,
    FileStateUpload,
} from '@/store/files/types'
import { isHiddenDirectory, moveKeys, removeKeys, splitPath, toEntry } from '@/store/files/helpers'
import type { FilePermission, GcodeMetadata } from '@/types/moonraker/FileManagerRPC'

export const mutations: MutationTree<FileState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setRootPermissions(state, payload: { root: string; permissions: FilePermission }) {
        if (state.roots[payload.root] === payload.permissions) return

        Vue.set(state.roots, payload.root, payload.permissions)
    },

    setDirectory(state, payload: { path: string; directory: FileStateDirectory }) {
        const directory: FileStateDirectory = {
            dirs: Object.freeze({ ...payload.directory.dirs }),
            files: Object.freeze({ ...payload.directory.files }),
            disk_usage: payload.directory.disk_usage,
        }

        Vue.set(state.directories, payload.path, Object.freeze(directory))
    },

    removeDirectoryTree(state, path: string) {
        state.directories = removeKeys(state.directories, path)
    },

    moveDirectoryTree(state, payload: { source: string; dest: string }) {
        state.directories = moveKeys(state.directories, payload.source, payload.dest)
    },

    /**
     * Adds or replaces an entry of a loaded directory. Entries of directories that are not loaded are ignored.
     * @param payload.path path of the entry, including the root
     */
    setDirectoryEntry(state, payload: { path: string; type: FileStateEntryType; item: FileStateEntryInfo }) {
        const { dir, name } = splitPath(payload.path)
        const directory = state.directories[dir]
        if (!directory || (payload.type === 'dirs' && isHiddenDirectory(name))) return

        const entries = Object.freeze({
            ...directory[payload.type],
            [name]: Object.freeze(toEntry(name, payload.item)),
        })
        Vue.set(state.directories, dir, Object.freeze({ ...directory, [payload.type]: entries }))
    },

    /** @param payload.path path of the entry, including the root */
    removeDirectoryEntry(state, payload: { path: string; type: FileStateEntryType }) {
        const { dir, name } = splitPath(payload.path)
        const directory = state.directories[dir]
        if (!directory || !(name in directory[payload.type])) return

        const entries = { ...directory[payload.type] }
        delete entries[name]

        Vue.set(state.directories, dir, Object.freeze({ ...directory, [payload.type]: Object.freeze(entries) }))
    },

    setMetadata(state, metadata: GcodeMetadata[]) {
        if (metadata.length === 0) return

        const output = { ...state.metadata }
        metadata.forEach((entry) => (output[entry.filename] = Object.freeze(entry)))

        state.metadata = output
    },

    removeMetadata(state, paths: string | string[]) {
        const list = Array.isArray(paths) ? paths : [paths]
        if (list.length === 0) return

        state.metadata = list.reduce((metadata, path) => removeKeys(metadata, path), state.metadata)
    },

    moveMetadata(state, payload: { source: string; dest: string }) {
        const metadata = moveKeys(state.metadata, payload.source, payload.dest)

        // the filename inside the metadata is the path, so it has to follow the new key
        Object.keys(metadata).forEach((key) => {
            if (metadata[key].filename !== key) metadata[key] = Object.freeze({ ...metadata[key], filename: key })
        })

        state.metadata = metadata
    },

    setUpload(state, payload: Partial<FileStateUpload>) {
        Object.assign(state.upload, payload)
    },

    resetUpload(state) {
        Object.assign(state.upload, getDefaultUpload())
    },
}
