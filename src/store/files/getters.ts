import { GetterTree } from 'vuex'
import { FileState, FileStateDirectoryListing, FileStateFile, FileStateGcodefile } from '@/store/files/types'
import { RootState } from '@/store/types'
import { splitExtension } from '@/plugins/helpers'
import {
    CONFIG_ROOT,
    GCODES_ROOT,
    THEME_DIR,
    createGcodeFileBuilder,
    getRoot,
    isGcodeFile,
    isHiddenPath,
    isInPath,
    joinPath,
    normalizePath,
    splitPath,
    stripRoot,
    toFile,
} from '@/store/files/helpers'
import type { FilePermission } from '@/types/moonraker/FileManagerRPC'

export const getters: GetterTree<FileState, RootState> = {
    isDirectoryLoaded: (state) => (path: string) => normalizePath(path) in state.directories,

    /** Returns the permissions of a directory, subdirectories get them from their parent directory. */
    getDirectoryPermissions:
        (state) =>
        (path: string): FilePermission => {
            const rootPermissions = state.roots[getRoot(path)] ?? 'r'
            const { dir, name } = splitPath(path)
            if (dir === '') return rootPermissions

            return state.directories[dir]?.dirs[name]?.permissions ?? rootPermissions
        },

    getDirectory:
        (state, getters) =>
        (path: string): FileStateDirectoryListing | null => {
            const normalized = normalizePath(path)
            const directory = state.directories[normalized]
            if (!directory) return null

            return {
                path: normalized,
                permissions: getters.getDirectoryPermissions(normalized),
                disk_usage: directory.disk_usage,
                items: [
                    ...Object.values(directory.dirs).map((entry) => toFile(entry, true)),
                    ...Object.values(directory.files).map((entry) => toFile(entry, false)),
                ],
            }
        },

    /** Checks if a file or directory exists in a loaded directory. */
    pathExists:
        (state) =>
        (path: string): boolean => {
            const { dir, name } = splitPath(path)
            const directory = state.directories[dir]
            if (!directory) return false

            return name in directory.dirs || name in directory.files
        },

    getFile:
        (state) =>
        (path: string): FileStateFile | null => {
            const { dir, name } = splitPath(path)
            const entry = state.directories[dir]?.files[name]
            if (!entry) return null

            return toFile(entry, false)
        },

    /**
     * Returns a gcode file with metadata and print history.
     * @param path path relative to the gcodes root
     */
    getGcodeFile:
        (state, _getters, rootState, rootGetters) =>
        (path: string): FileStateGcodefile | null => {
            const normalized = normalizePath(path)
            const { dir, name } = splitPath(joinPath(GCODES_ROOT, normalized))
            const entry = state.directories[dir]?.files[name]
            if (!entry) return null

            return createGcodeFileBuilder(state, rootState, rootGetters)(entry, normalized, false, name)
        },

    /**
     * Returns the directories and gcode files of a directory in the gcodes root.
     * @param path path relative to the gcodes root
     */
    getGcodeFiles:
        (state, _getters, rootState, rootGetters) =>
        (path: string): FileStateGcodefile[] => {
            const dirPath = normalizePath(path)
            const directory = state.directories[joinPath(GCODES_ROOT, dirPath)]
            if (!directory) return []

            const build = createGcodeFileBuilder(state, rootState, rootGetters)
            const dirs = Object.values(directory.dirs).map((entry) =>
                build(entry, joinPath(dirPath, entry.name), true, entry.name)
            )
            const files = Object.values(directory.files)
                .filter((entry) => isGcodeFile(entry.name))
                .map((entry) => build(entry, joinPath(dirPath, entry.name), false, entry.name))

            return [...dirs, ...files]
        },

    /**
     * Returns all gcode files of the gcodes root and its subdirectories, without hidden files and directories.
     * The filename is the path relative to the gcodes root.
     */
    allGcodeFiles: (state, _getters, rootState, rootGetters): FileStateGcodefile[] => {
        const build = createGcodeFileBuilder(state, rootState, rootGetters)
        const output: FileStateGcodefile[] = []

        Object.entries(state.directories).forEach(([dirPath, directory]) => {
            if (!isInPath(dirPath, GCODES_ROOT)) return

            const relativeDir = stripRoot(dirPath)
            Object.values(directory.files)
                .filter((entry) => isGcodeFile(entry.name))
                .forEach((entry) => {
                    const path = joinPath(relativeDir, entry.name)
                    if (!isHiddenPath(path)) output.push(build(entry, path, false, path))
                })
        })

        return output
    },

    getThemeFileUrl:
        (state, _getters, _rootState, rootGetters) =>
        (acceptName: string, acceptExtensions: string[]): string | null => {
            const files = Object.values(state.directories[THEME_DIR]?.files ?? {})
            const file = files.find((entry) => {
                const { name, extension } = splitExtension(entry.name)
                return name === acceptName && acceptExtensions.includes(extension)
            })
            if (!file) return null

            return `${rootGetters['socket/getUrl']}/server/files/${THEME_DIR}/${file.name}?timestamp=${
                file.modified * 1000
            }`
        },

    sidebarLogoUrl: (state, getters): string | null =>
        getters.getThemeFileUrl('sidebar-logo', ['.svg', '.jpg', '.jpeg', '.png', '.gif']),

    sidebarBackgroundUrl: (state, getters): string | null =>
        getters.getThemeFileUrl('sidebar-background', ['.jpg', '.jpeg', '.png', '.gif', '.svg']),

    mainBackgroundUrl: (state, getters): string | null =>
        getters.getThemeFileUrl('main-background', ['.jpg', '.jpeg', '.png', '.gif', '.svg']),

    customStylesheetUrl: (state, getters): string | null => getters.getThemeFileUrl('custom', ['.css']),

    customNaviPointsUrl: (state, getters): string | null => getters.getThemeFileUrl('navi', ['.json']),

    /** Returns the urls of the 16x16 and 32x32 favicons, a missing size falls back to the other one. */
    customFaviconUrls: (state, getters): [string, string] | null => {
        const acceptExtensions = ['.png', '.svg']
        const favicon16: string | null = getters.getThemeFileUrl('favicon-16x16', acceptExtensions)
        const favicon32: string | null = getters.getThemeFileUrl('favicon-32x32', acceptExtensions)
        const fallback = favicon16 ?? favicon32
        if (!fallback) return null

        return [favicon16 ?? fallback, favicon32 ?? fallback]
    },

    hasConfigFile:
        (state) =>
        (name: string): boolean =>
            name in (state.directories[CONFIG_ROOT]?.files ?? {}),
}
