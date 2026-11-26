import Vue from 'vue'
import { MutationTree } from 'vuex'
import { getDefaultState, getDefaultUpload } from '@/store/files/index'
import { FileState, FileStateDirectory, FileStateEntry, FileStateUpload } from '@/store/files/types'
import { isInPath, replacePathPrefix } from '@/store/files/paths'
import type { FilePermission, GcodeMetadata } from '@/types/moonraker/FileManagerRPC'

type EntryType = 'dirs' | 'files'

/** Re-keys all keys inside `source` to `dest`. Existing keys inside `dest` are dropped. */
const moveKeys = <T>(record: Record<string, T>, source: string, dest: string): Record<string, T> => {
    const output: Record<string, T> = {}

    for (const [key, value] of Object.entries(record)) {
        if (isInPath(key, source)) output[replacePathPrefix(key, source, dest)] = value
        else if (!isInPath(key, dest)) output[key] = value
    }

    return output
}

/** Removes all keys inside `path`. An empty path removes everything. */
const removeKeys = <T>(record: Record<string, T>, path: string): Record<string, T> => {
    if (path === '') return {}

    return Object.fromEntries(Object.entries(record).filter(([key]) => !isInPath(key, path)))
}

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

    setDirectoryEntry(state, payload: { path: string; type: EntryType; entry: FileStateEntry }) {
        const directory = state.directories[payload.path]
        if (!directory) return

        const entries = Object.freeze({
            ...directory[payload.type],
            [payload.entry.name]: Object.freeze(payload.entry),
        })
        Vue.set(state.directories, payload.path, Object.freeze({ ...directory, [payload.type]: entries }))
    },

    removeDirectoryEntry(state, payload: { path: string; type: EntryType; name: string }) {
        const directory = state.directories[payload.path]
        if (!directory || !(payload.name in directory[payload.type])) return

        const entries = { ...directory[payload.type] }
        delete entries[payload.name]

        Vue.set(
            state.directories,
            payload.path,
            Object.freeze({ ...directory, [payload.type]: Object.freeze(entries) })
        )
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
