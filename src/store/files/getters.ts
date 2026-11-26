import { GetterTree } from 'vuex'
import { themeDir, validGcodeExtensions } from '@/store/variables'
import {
    FileState,
    FileStateDirectoryListing,
    FileStateEntry,
    FileStateFile,
    FileStateGcodefile,
} from '@/store/files/types'
import { ServerHistoryStateJob } from '@/store/server/history/types'
import { RootState } from '@/store/types'
import { getExtension, getRoot, isInPath, joinPath, normalizePath, splitPath, stripRoot } from '@/store/files/paths'
import type { FilePermission } from '@/types/moonraker/FileManagerRPC'

const GCODES_ROOT = 'gcodes'

const PREHEAT_GCODES = [
    { name: 'first_layer_extr_temp', gcode: 'M104' },
    { name: 'first_layer_bed_temp', gcode: 'M140' },
    { name: 'chamber_temp', gcode: 'M141' },
] as const

const toFile = (entry: FileStateEntry, isDirectory: boolean): FileStateFile => ({
    isDirectory,
    filename: entry.name,
    modified: new Date(entry.modified * 1000),
    size: entry.size,
    permissions: entry.permissions,
})

const isGcodeFilename = (filename: string): boolean => validGcodeExtensions.includes(getExtension(filename))

const getPermissions = (state: FileState, path: string): FilePermission => {
    const rootPermissions = state.roots[getRoot(path)] ?? 'r'
    const { dir, name } = splitPath(path)
    if (dir === '') return rootPermissions

    return state.directories[dir]?.dirs[name]?.permissions ?? rootPermissions
}

/**
 * Returns a function that combines a file of the gcodes root with its metadata and print history.
 * Everything that is the same for all files is calculated once.
 */
const createGcodeFileBuilder = (state: FileState, rootState: RootState, rootGetters: Record<string, unknown>) => {
    const commands = Object.keys(rootState.printer?.gcode?.commands ?? {})
    const preheatGcodes = PREHEAT_GCODES.filter((obj) => commands.includes(obj.gcode))
    const getPrintJobs = rootGetters['server/history/getPrintJobsForGcodes'] as (
        filename: string,
        modified: number,
        filesize: number,
        uuid: string | null,
        job_id: string | null
    ) => ServerHistoryStateJob[]

    /**
     * @param entry file or directory entry
     * @param path path of the entry relative to the gcodes root
     * @param isDirectory
     * @param filename name to display, e.g. the name or the path relative to the gcodes root
     */
    return (entry: FileStateEntry, path: string, isDirectory: boolean, filename: string): FileStateGcodefile => {
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

        const histories = getPrintJobs(
            path,
            entry.modified * 1000,
            entry.size,
            metadata?.uuid ?? null,
            metadata?.job_id ?? null
        )
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
        file.last_end_time = new Date(lastCompleted.end_time * 1000)
        file.last_filament_used = lastCompleted.filament_used
        file.last_print_duration = lastCompleted.print_duration
        file.last_total_duration = lastCompleted.total_duration

        return file
    }
}

export const getters: GetterTree<FileState, RootState> = {
    isDirectoryLoaded: (state) => (path: string) => normalizePath(path) in state.directories,

    getDirectory:
        (state) =>
        (path: string): FileStateDirectoryListing | null => {
            const normalized = normalizePath(path)
            const directory = state.directories[normalized]
            if (!directory) return null

            return {
                path: normalized,
                permissions: getPermissions(state, normalized),
                disk_usage: directory.disk_usage,
                items: [
                    ...Object.values(directory.dirs).map((entry) => toFile(entry, true)),
                    ...Object.values(directory.files).map((entry) => toFile(entry, false)),
                ],
            }
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
        (state, getters, rootState, rootGetters) =>
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
        (state, getters, rootState, rootGetters) =>
        (path: string): FileStateGcodefile[] => {
            const dirPath = normalizePath(path)
            const directory = state.directories[joinPath(GCODES_ROOT, dirPath)]
            if (!directory) return []

            const build = createGcodeFileBuilder(state, rootState, rootGetters)
            const dirs = Object.values(directory.dirs).map((entry) =>
                build(entry, joinPath(dirPath, entry.name), true, entry.name)
            )
            const files = Object.values(directory.files)
                .filter((entry) => isGcodeFilename(entry.name))
                .map((entry) => build(entry, joinPath(dirPath, entry.name), false, entry.name))

            return [...dirs, ...files]
        },

    /**
     * Returns all gcode files of the gcodes root and its subdirectories.
     * The filename is the path relative to the gcodes root.
     */
    getAllGcodes: (state, getters, rootState, rootGetters): FileStateGcodefile[] => {
        const build = createGcodeFileBuilder(state, rootState, rootGetters)
        const output: FileStateGcodefile[] = []

        Object.entries(state.directories).forEach(([dirPath, directory]) => {
            if (!isInPath(dirPath, GCODES_ROOT)) return

            const relativeDir = stripRoot(dirPath)
            Object.values(directory.files)
                .filter((entry) => isGcodeFilename(entry.name))
                .forEach((entry) => {
                    const path = joinPath(relativeDir, entry.name)
                    output.push(build(entry, path, false, path))
                })
        })

        return output
    },

    getThemeFileUrl:
        (state, getters, rootState, rootGetters) =>
        (acceptName: string, acceptExtensions: string[]): string | null => {
            const files = Object.values(state.directories[`config/${themeDir}`]?.files ?? {})
            const file = files.find((entry) => {
                const pos = entry.name.lastIndexOf('.')
                if (pos === -1) return false

                return entry.name.slice(0, pos) === acceptName && acceptExtensions.includes(entry.name.slice(pos + 1))
            })
            if (!file) return null

            return `${rootGetters['socket/getUrl']}/server/files/config/${themeDir}/${file.name}?timestamp=${
                file.modified * 1000
            }`
        },

    getSidebarLogo: (state, getters) => {
        const acceptName = 'sidebar-logo'
        const acceptExtensions = ['svg', 'jpg', 'jpeg', 'png', 'gif']

        return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? ''
    },

    getCustomSidebarBackground: (state, getters) => {
        const acceptName = 'sidebar-background'
        const acceptExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']

        return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? null
    },

    getMainBackground: (state, getters) => {
        const acceptName = 'main-background'
        const acceptExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']

        return getters['getThemeFileUrl'](acceptName, acceptExtensions)
    },

    getCustomStylesheet: (state, getters) => {
        const acceptName = 'custom'
        const acceptExtensions = ['css']

        return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? null
    },

    getCustomNaviPoints: (state, getters) => {
        const acceptName = 'navi'
        const acceptExtensions = ['json']

        return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? null
    },

    getCustomFavicons: (state, getters) => {
        const acceptName16 = 'favicon-32x32'
        const acceptName32 = 'favicon-32x32'
        const acceptExtensions = ['png', 'svg']

        const favicon16 = getters['getThemeFileUrl'](acceptName16, acceptExtensions)
        const favicon32 = getters['getThemeFileUrl'](acceptName32, acceptExtensions)

        if (favicon16 && favicon32) return [favicon16, favicon32]
        else if (favicon16) return [favicon16, favicon16]
        else if (favicon32) return [favicon32, favicon32]

        return null
    },

    checkConfigFile: (state) => (acceptName: string) => acceptName in (state.directories.config?.files ?? {}),
}
