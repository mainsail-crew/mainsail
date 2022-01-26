import Vue from 'vue'
import { ActionTree } from 'vuex'
import {
    ApiGetDirectoryReturn,
    ApiGetDirectoryReturnDir,
    ApiGetDirectoryReturnFile,
    FileState,
    FileStateFile
} from '@/store/files/types'
import {RootState} from '@/store/types'
import i18n from '@/plugins/i18n'

export const actions: ActionTree<FileState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    initRootDirs({ state, commit }, dirs) {
        dirs.forEach((dirname: string) => {
            if (state.filetree.findIndex((tmp: FileStateFile) => tmp.filename === dirname) === -1) {
                commit('createRootDir', {
                    name: dirname,
                    permissions: 'r'
                })
                Vue.$socket.emit('server.files.get_directory', { path: dirname }, { action: 'files/getDirectory' })
            }
        })
    },

    getDirectory({ state, commit, getters }, payload: ApiGetDirectoryReturn) {
        const pathArray = payload.requestParams.path.split('/')
        const root = pathArray.length ? pathArray[0] : payload.requestParams.path

        const slashIndex = payload.requestParams.path.indexOf('/')
        const path = slashIndex > 1 ? payload.requestParams.path.substr( slashIndex+ 1) : ''
        const directory = getters['getDirectory'](root+'/'+path)

        if (directory?.childrens?.length) {
            directory?.childrens.forEach((item: FileStateFile) => {
                if (item?.isDirectory && payload.dirs?.findIndex((element: ApiGetDirectoryReturnDir) => element.dirname === item.filename) < 0) {
                    commit('setDeleteDir', {
                        item: {
                            path: path.length ? path+'/'+item.filename : item.filename,
                            root: root
                        }
                    })
                } else if (!item?.isDirectory && payload.files?.findIndex((element: ApiGetDirectoryReturnFile) => element.filename === item.filename) < 0) {
                    commit('setDeleteFile', {
                        item: {
                            path: path.length ? path+'/'+item.filename : item.filename,
                            root: root
                        }
                    })
                }
            })
        }

        if (payload.dirs?.length) {
            payload.dirs.forEach((dir: ApiGetDirectoryReturnDir) => {
                if (directory?.childrens?.findIndex((element: FileStateFile) => (element.isDirectory && element.filename === dir.dirname)) === -1) {
                    commit('setCreateDir', {
                        item: {
                            path: path.length ? path+'/'+dir.dirname : dir.dirname,
                            root: root,
                            permissions: dir.permissions,
                            modified: dir.modified * 1000
                        }
                    })

                    Vue.$socket.emit('server.files.get_directory', { path: payload.requestParams.path+'/'+dir.dirname }, { action: 'files/getDirectory' })
                }
            })
        }

        if (payload.files?.length) {
            payload.files.forEach((file: ApiGetDirectoryReturnFile) => {
                const existingFile = directory?.childrens?.find((element: FileStateFile) => (!element.isDirectory && element.filename === file.filename))

                if (existingFile && (
                    existingFile.size !== file.size ||
					existingFile.modified.getTime() !== new Date(file.modified*1000).getTime()
                )) {
                    commit('setModifyFile', {
                        item: {
                            path: path.length ? path+'/'+file.filename : file.filename,
                            root: root,
                            modified: file.modified,
                            size: file.size,
                        }
                    })
                } else if (!existingFile) {
                    commit('setCreateFile', {
                        item: {
                            path: path.length ? path+'/'+file.filename : file.filename,
                            root: root,
                            permissions: file.permissions,
                            modified: file.modified,
                            size: file.size,
                        }
                    })
                }
            })
        }

        if (payload?.root_info?.name) {
            const rootState = state.filetree.find((dir: FileStateFile) => dir.filename === payload?.root_info?.name)
            if (rootState && rootState.permissions !== payload.root_info?.permissions) commit('setRootPermissions', payload.root_info)
        }

        if (payload.requestParams?.path && payload.disk_usage) {
            commit('setDiskUsage', { disk_usage: payload.disk_usage, path: payload.requestParams.path })
        }
    },

    requestMetadata({ commit }, payload: { filename: string }) {
        const rootPath = payload.filename.substr(0, payload.filename.indexOf('/'))
        if (rootPath === 'gcodes') {
            const requestFilename = payload.filename.substr(7)
            commit('setMetadataRequested', { filename: requestFilename })
            Vue.$socket.emit('server.files.metadata', { filename: requestFilename }, { action: 'files/getMetadata' })
        }
    },

    getMetadata({ commit, rootState }, payload) {
        if (payload !== undefined && payload.filename !== '') {
            if (payload.filename === rootState?.printer?.print_stats?.filename) {
                commit('printer/clearCurrentFile', null, { root: true })
                commit('printer/setData', { current_file: payload }, { root: true })
            }

            commit('setMetadata', payload)
        }
    },

    getMetadataCurrentFile({ commit }, payload) {
        commit('printer/clearCurrentFile', null, { root: true })
        commit('printer/setData', { current_file: payload }, { root: true })
    },

    filelist_changed({ commit, dispatch }, payload) {
        switch(payload.action) {
        case 'create_file':
            commit('setCreateFile', payload)
            break

        case 'move_file':
            if (payload.source_item?.path === 'printer_autosave.cfg' && payload.source_item?.root === 'config')
                commit('setCreateFile', payload)
            else
                commit('setMoveFile', payload)
            break

        case 'delete_file':
            commit('setDeleteFile', payload)
            break

        case 'modify_file':
            commit('setModifyFile', payload)
            break

        case 'create_dir':
            commit('setCreateDir', payload)
            break

        case 'move_dir':
            commit('setMoveDir', payload)
            break

        case 'delete_dir':
            commit('setDeleteDir', payload)
            break

        case 'root_update':
            dispatch('server/addRootDirectory', payload, { root: true })
            commit('setRootUpdate', payload)
            break

        default:
            window.console.error('Unknown filelist_changed action: '+payload.action)
            break
        }
    },

    getMove(_, payload) {
        if (payload.error) {
            Vue.$toast.error(payload.error.message)
        } else {
            const filename = payload.requestParams.dest.substr(payload.requestParams.dest.lastIndexOf('/')).replace('/', '')
            const sourceDir = payload.requestParams.dest.substr(0, payload.requestParams.dest.lastIndexOf('/'))
            const destDir = payload.requestParams.dest.substr(0, payload.requestParams.dest.lastIndexOf('/'))


            if (sourceDir === destDir) Vue.$toast.success(<string>i18n.t('Files.SuccessfullyRenamed', {filename}))
            else Vue.$toast.success(<string>i18n.t('Files.SuccessfullyMoved', {filename}))
        }
    },

    getCreateDir(_, payload) {
        if (payload.error) {
            Vue.$toast.error(payload.error.message)
        } else {
            const newPath = payload.requestParams.path.substr(payload.requestParams.path.lastIndexOf('/')+1)

            Vue.$toast.success(<string>i18n.t('Files.SuccessfullyCreated', {filename: newPath}))
        }
    },

    getDeleteDir(_, payload) {
        if (payload.error) {
            Vue.$toast.error(payload.error.message)
        } else {
            const delPath = payload.requestParams.path.substr(payload.requestParams.path.lastIndexOf('/')+1)

            Vue.$toast.success(<string>i18n.t('Files.SuccessfullyDeleted', {filename: delPath}))
        }
    },

    getDeleteFile(_, payload) {
        if (payload.error) {
            Vue.$toast.error(payload.error.message)
        } else {
            const delPath = payload.item.path.substr(payload.item.path.lastIndexOf('/')+1)
            const fileExtension = payload.item.path.substr(payload.item.path.lastIndexOf('.')+1)

            if (!(payload.item.root === 'timelapse' && fileExtension === 'jpg'))
                Vue.$toast.success(<string>i18n.t('Files.SuccessfullyDeleted', {filename: delPath}))
        }
    },
}