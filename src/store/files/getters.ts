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
        (path: string | null, boolShowHiddenFiles: boolean, boolShowPrintedFiles: boolean) => {
            const rootGcodes = getters['getDirectory']('gcodes')
            if (rootGcodes === null) return []

            let baseURL = `${rootGetters['socket/getUrl']}/server/files/gcodes`
            let files: FileStateFile[] = []

            if (path !== null) {
                baseURL += encodeURI(path)
                const directory = getters['getDirectory']('gcodes' + path)
                files = directory?.childrens ?? []
            } else {
                const searchGcodes = (directory: FileStateFile, currentPath: string) => {
                    if (directory.isDirectory && directory.childrens?.length) {
                        directory.childrens?.forEach((file) => {
                            if (!file.isDirectory) {
                                const tmp = { ...file }
                                tmp.filename = currentPath + file.filename
                                files.push(tmp)
                            } else searchGcodes(file, currentPath + file.filename + '/')
                        })
                    }
                }

                searchGcodes(rootGcodes, '')
            }

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
                    preheat_gcode: null,
                    small_thumbnail: null,
                    big_thumbnail: null,
                    big_thumbnail_width: null,
                    count_printed: 0,
                    last_start_time: null,
                    last_end_time: null,
                    last_filament_used: null,
                    last_status: null,
                    last_print_duration: null,
                    last_total_duration: null,
                }

                const preheat_gcode_array: string[] = []
                const preheat_gcode_objects = [
                    { name: 'first_layer_extr_temp', gcode: 'M104' },
                    { name: 'first_layer_bed_temp', gcode: 'M140' },
                ]

                preheat_gcode_objects.forEach((object) => {
                    if (object.name in file && file[object.name] > 1) {
                        preheat_gcode_array.push(`${object.gcode} S${file[object.name]}`)
                    }
                })

                if (preheat_gcode_array.length) {
                    tmp.preheat_gcode = preheat_gcode_array.join('\n')
                }

                if (file.thumbnails?.length) {
                    let subdirectory = ''
                    if (path === null) {
                        const pos = file.filename.lastIndexOf('/')
                        if (pos > 0) subdirectory = '/' + file.filename.slice(0, pos)
                    }

                    const small_thumbnail = file.thumbnails.find(
                        (thumb) =>
                            thumb.width >= thumbnailSmallMin &&
                            thumb.width <= thumbnailSmallMax &&
                            thumb.height >= thumbnailSmallMin &&
                            thumb.height <= thumbnailSmallMax
                    )

                    if (small_thumbnail && 'relative_path' in small_thumbnail) {
                        tmp.small_thumbnail = `${baseURL + subdirectory}/${encodeURI(
                            small_thumbnail.relative_path
                        )}?timestamp=${fileTimestamp}`
                    }

                    const big_thumbnail = file.thumbnails.find((thumb) => thumb.width >= thumbnailBigMin)

                    if (big_thumbnail && 'relative_path' in big_thumbnail) {
                        tmp.big_thumbnail = `${baseURL + subdirectory}/${encodeURI(
                            big_thumbnail.relative_path
                        )}?timestamp=${fileTimestamp}`

                        tmp.big_thumbnail_width = big_thumbnail.width
                    }
                }

                const fullFilename = path && path.length ? path + '/' + file.filename : file.filename
                let histories = rootGetters['server/history/getPrintJobsForGcodes'](
                    fullFilename,
                    fileTimestamp,
                    file.size,
                    file.uuid ?? null,
                    file.job_id
                )

                if (histories && histories.length) {
                    histories = histories.sort(
                        (a: ServerHistoryStateJob, b: ServerHistoryStateJob) => b.start_time - a.start_time
                    )

                    const histories_completed = histories.filter(
                        (history: ServerHistoryStateJob) => history.status === 'completed'
                    )

                    const last_history = [...histories].shift()
                    tmp.last_status = last_history.status
                    tmp.count_printed = histories_completed.length
                    tmp.last_start_time = new Date(last_history.start_time * 1000)

                    if (tmp.count_printed > 0) {
                        const history_completed = histories_completed[0]
                        tmp.last_start_time = new Date(history_completed.start_time * 1000)
                        tmp.last_end_time = new Date(history_completed.end_time * 1000)
                        tmp.last_filament_used = history_completed.filament_used
                        tmp.last_print_duration = history_completed.print_duration
                        tmp.last_total_duration = history_completed.total_duration
                    }
                }

                if (boolShowPrintedFiles) output.push(tmp)
                else if (tmp.count_printed === 0) output.push(tmp)
            })

            return output
        },

    getAllGcodes: (state, getters) => {
        return getters['getGcodeFiles'](null, false, true)
    },

    getThemeFileUrl: (state, getters, rootState, rootGetters) => (acceptName: string, acceptExtensions: string[]) => {
        const directory = getters['getDirectory']('config/' + themeDir)

        const file = directory?.childrens?.find(
            (element: FileStateFile) =>
                element.filename?.slice(0, element.filename?.lastIndexOf('.')) === acceptName &&
                acceptExtensions.includes(element.filename?.slice(element.filename?.lastIndexOf('.') + 1))
        )
        if (!file) return null

        return `${rootGetters['socket/getUrl']}/server/files/config/${themeDir}/${
            file.filename
        }?timestamp=${file.modified.getTime()}`
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

    getSmallThumbnail: (state, getters, rootState, rootGetters) => (item: FileStateFile, currentPath: string) => {
        if ('thumbnails' in item && item.thumbnails?.length) {
            const thumbnail = item.thumbnails.find(
                (thumb) =>
                    thumb.width >= thumbnailSmallMin &&
                    thumb.width <= thumbnailSmallMax &&
                    thumb.height >= thumbnailSmallMin &&
                    thumb.height <= thumbnailSmallMax
            )

            if (thumbnail && 'relative_path' in thumbnail) {
                return `${rootGetters['socket/getUrl']}/server/files/${currentPath}/${encodeURI(
                    thumbnail.relative_path
                )}?timestamp=${item.modified.getTime()}`
            }
        }

        return ''
    },

    getBigThumbnail: (state, getters, rootState, rootGetters) => (item: FileStateFile, currentPath: string) => {
        if ('thumbnails' in item && item.thumbnails?.length) {
            const thumbnail = item.thumbnails.find((thumb) => thumb.width >= thumbnailBigMin)

            if (thumbnail && 'relative_path' in thumbnail) {
                return `${rootGetters['socket/getUrl']}/server/files/${encodeURI(currentPath)}/${encodeURI(
                    thumbnail.relative_path
                )}?timestamp=${item.modified.getTime()}`
            }
        }

        return ''
    },
}
