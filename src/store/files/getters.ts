import {
    themeDir,
    thumbnailBigMin,
    thumbnailSmallMax,
    thumbnailSmallMin,
    validGcodeExtensions,
} from '@/store/variables'
import { GetterTree } from 'vuex'
import { FileState, FileStateFile, FileStateGcodefile } from '@/store/files/types'
import { ServerHistoryStateJob } from '@/store/server/history/types'

// eslint-disable-next-line
export const getters: GetterTree<FileState, any> = {
    getDirectory: (state) => (requestedPath: string) => {
        if (requestedPath.startsWith('/')) requestedPath = requestedPath.substr(1)
        if (requestedPath.endsWith('/')) requestedPath = requestedPath.substr(0, requestedPath.length - 1)

        const findDirectory = function (filetree: FileStateFile, pathArray: string[]): FileStateFile | null {
            if (pathArray.length) {
                const newFiletree = filetree?.childrens?.find(
                    (element: FileStateFile) => element.isDirectory && element.filename === pathArray[0]
                )
                if (newFiletree) {
                    pathArray.shift()
                    return findDirectory(newFiletree, pathArray)
                } else return null
            }

            return filetree
        }

        return findDirectory({ childrens: state.filetree } as FileStateFile, requestedPath.split('/'))
    },

    getFile: (state, getters) => (requestedFilename: string) => {
        const path = requestedFilename.slice(0, requestedFilename.lastIndexOf('/'))
        const filename = requestedFilename.slice(requestedFilename.lastIndexOf('/') + 1)
        const directory = getters['getDirectory'](path)

        return directory?.childrens?.find((file: FileStateFile) => file.filename === filename && !file.isDirectory)
    },

    getGcodeFiles:
        (state, getters, rootState, rootGetters) =>
        (path: string, boolShowHiddenFiles: boolean, boolShowPrintedFiles: boolean) => {
            const directory = getters['getDirectory']('gcodes' + path)
            const baseURL = `${rootGetters['socket/getUrl']}/server/files/gcodes${encodeURI(path)}`
            let files = directory?.childrens ?? []

            files = files.filter((file: FileStateFile) => {
                // filter hidden files
                if (!boolShowHiddenFiles && (file.filename === 'thumbs' || file.filename.startsWith('.'))) return false

                // START filter != gcode files or dirs
                if (file.isDirectory) return true

                const pos = file.filename.lastIndexOf('.')
                const extension = file.filename.slice(pos)

                return validGcodeExtensions.includes(extension)
                // END filter != gcode files or dirs
            })

            // build gcode files array with all data in one array
            const output: FileStateGcodefile[] = []
            files.forEach((file: FileStateFile) => {
                const fileTimestamp = typeof file.modified.getTime === 'function' ? file.modified.getTime() : 0
                const tmp: FileStateGcodefile = {
                    ...file,
                    small_thumbnail: null,
                    big_thumbnail: null,
                    big_thumbnail_width: null,
                    count_printed: 0,
                    last_start_time: null,
                    last_end_time: null,
                    last_filament_used: null,
                    last_status: '',
                    last_print_duration: null,
                    last_total_duration: null,
                }

                if (file.thumbnails?.length) {
                    const small_thumbnail = file.thumbnails.find(
                        (thumb) =>
                            thumb.width >= thumbnailSmallMin &&
                            thumb.width <= thumbnailSmallMax &&
                            thumb.height >= thumbnailSmallMin &&
                            thumb.height <= thumbnailSmallMax
                    )

                    if (small_thumbnail && 'relative_path' in small_thumbnail) {
                        tmp.small_thumbnail = `${baseURL}/${encodeURI(
                            small_thumbnail.relative_path
                        )}?timestamp=${fileTimestamp}`
                    }

                    const big_thumbnail = file.thumbnails.find((thumb) => thumb.width >= thumbnailBigMin)

                    if (big_thumbnail && 'relative_path' in big_thumbnail) {
                        tmp.big_thumbnail = `${baseURL}/${encodeURI(
                            big_thumbnail.relative_path
                        )}?timestamp=${fileTimestamp}`

                        tmp.big_thumbnail_width = big_thumbnail.width
                    }
                }

                const fullFilename = path.length ? path + '/' + file.filename : file.filename
                const histories = rootGetters['server/history/getPrintJobsForGcodes'](
                    fullFilename,
                    fileTimestamp,
                    file.size,
                    file.uuid ?? null,
                    file.job_id
                )
                if (histories && histories.length) {
                    const history = histories[0]
                    tmp.last_end_time = new Date(history.end_time * 1000)
                    tmp.last_filament_used = history.filament_used
                    tmp.last_print_duration = history.print_duration
                    tmp.last_start_time = new Date(history.start_time * 1000)
                    tmp.last_status = history.status
                    tmp.last_total_duration = history.total_duration

                    tmp.count_printed = histories.filter(
                        (job: ServerHistoryStateJob) => job.status === 'completed'
                    ).length
                }

                if (boolShowPrintedFiles) output.push(tmp)
                else if (tmp.last_status !== 'completed') output.push(tmp)
            })

            return output
        },

    getThemeFileUrl: (state, getters, rootState, rootGetters) => (acceptName: string, acceptExtensions: string[]) => {
        const directory = getters['getDirectory']('config/' + themeDir)

        const file = directory?.childrens?.find(
            (element: FileStateFile) =>
                element.filename !== undefined &&
                element.filename.substr(0, element.filename.lastIndexOf('.')) === acceptName &&
                acceptExtensions.includes(element.filename.substr(element.filename.lastIndexOf('.') + 1))
        )
        return file ? rootGetters['socket/getUrl'] + '/server/files/config/' + themeDir + '/' + file.filename : null
    },

    getSidebarLogo: (state, getters) => {
        const acceptName = 'sidebar-logo'
        const acceptExtensions = ['svg', 'jpg', 'jpeg', 'png', 'gif']

        return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? ''
    },

    getSidebarBackground: (state, getters) => {
        const acceptName = 'sidebar-background'
        const acceptExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg']

        return getters['getThemeFileUrl'](acceptName, acceptExtensions) ?? '/img/sidebar-background.svg'
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

    getDiskUsage: (state) => (path: string) => {
        if (path.indexOf('/') === 0) path = path.substr(1)
        if (path.indexOf('/') !== -1) path = path.substr(0, path.indexOf('/'))

        const dir = state.filetree.find((dir) => dir.filename === path)
        if (dir && 'disk_usage' in dir) return dir.disk_usage

        return null
    },

    checkConfigFile: (state, getters) => (acceptName: string) => {
        const directory = getters['getDirectory']('config')

        return (
            directory?.childrens?.findIndex(
                (element: FileStateFile) => element.filename !== undefined && element.filename === acceptName
            ) !== -1
        )
    },
}
