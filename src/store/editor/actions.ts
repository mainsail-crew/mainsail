import { ActionTree } from 'vuex'
import { EditorState } from '@/store/editor/types'
import { RootState } from '@/store/types'
import axios from 'axios'
import { sha256 } from 'js-sha256'
import Vue from 'vue'
import i18n from '@/plugins/i18n'
import { escapePath, formatFilesize, windowBeforeUnloadFunction } from '@/plugins/helpers'

export const actions: ActionTree<EditorState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    downloadProgress({ commit }, payload: { progressEvent: any; direction: string; filesize: number | null }) {
        commit('updateLoader', {
            direction: payload.direction,
            speed: formatFilesize(payload.progressEvent.rate ?? 0),
            loaded: payload.progressEvent.loaded,
            total: payload.filesize ?? payload.progressEvent.total,
        })
    },

    openFile({ state, dispatch, commit, rootGetters }, payload) {
        const fullFilepathArray = []
        fullFilepathArray.push(payload.root)
        let path = payload.path
        if (path.slice(0, 1) === '/') path = path.slice(1)
        if (path.slice(-1) === '/') path = path.slice(0, -1)
        if (path !== '') fullFilepathArray.push(path)
        fullFilepathArray.push(payload.filename)

        const fullFilepath = fullFilepathArray.join('/')
        const url = rootGetters['socket/getUrl'] + '/server/files/' + escapePath(fullFilepath) + `?${Date.now()}`

        if (state.cancelToken) dispatch('cancelLoad')

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        commit('updateCancelTokenSource', source)
        commit('updateLoaderState', true)

        commit('setFilename', payload.filename)
        commit('setPermissions', payload.permissions)

        axios
            .get(url, {
                cancelToken: source.token,
                onDownloadProgress: (progressEvent) =>
                    dispatch('downloadProgress', {
                        progressEvent,
                        direction: 'downloading',
                        filesize: payload.size,
                    }),
                responseType: 'blob',
            })
            .then((res) => res.data.text())
            .then((file) => {
                commit('openFile', {
                    filename: payload.filename,
                    fileroot: payload.root,
                    filepath: path,
                    file,
                })
            })
            .finally(() => {
                setTimeout(() => {
                    dispatch('clearLoader')
                }, 100)
            })
    },

    async saveFile(
        { state, commit, getters, rootGetters, dispatch },
        payload: { content: string; restartServiceName: string | null }
    ) {
        const content = new Blob([payload.content], { type: 'text/plain' })
        const formData = new FormData()
        formData.append('file', content, state.filename)
        formData.append('root', state.fileroot)
        formData.append('path', state.filepath)
        formData.append('checksum', sha256(payload.content))

        const url = rootGetters['socket/getUrl'] + '/server/files/upload'
        if (state.cancelToken) dispatch('cancelLoad')
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        commit('updateCancelTokenSource', source)
        commit('updateLoaderState', true)

        axios
            .post(url, formData, {
                cancelToken: source.token,
                onUploadProgress: (progressEvent) =>
                    dispatch('downloadProgress', {
                        progressEvent,
                        direction: 'uploading',
                        filesize: null,
                    }),
            })
            .then((response) => {
                return response.data
            })
            .then((data) => {
                dispatch('clearLoader')
                Vue.$toast.success(i18n.t('Editor.SuccessfullySaved', { filename: data.item.path }).toString())
                if (payload.restartServiceName === 'klipper') {
                    const klipperRestartMethod = getters['getKlipperRestartMethod']
                    Vue.$socket.emit('printer.gcode.script', { script: klipperRestartMethod })
                } else if (payload.restartServiceName === 'moonraker') {
                    Vue.$socket.emit('server.restart', {})
                } else if (payload.restartServiceName !== null) {
                    Vue.$socket.emit('machine.services.restart', { service: payload.restartServiceName })
                }

                commit('updateLoadedHash', payload.content)

                if (payload.restartServiceName !== null) dispatch('close')
            })
            .catch((error) => {
                window.console.log(error.response?.data.error)
                dispatch('clearLoader')
                Vue.$toast.error(i18n.t('Editor.FailedSave', { filename: state.filename }).toString())
            })
    },

    cancelLoad({ state, commit, dispatch }) {
        if (state.cancelToken) {
            state.cancelToken.cancel('User canceled upload/download')
            commit('updateCancelTokenSource', null)
            dispatch('clearLoader')
        }
    },

    clearLoader({ commit }) {
        commit('updateLoaderState', false)
        commit('updateLoader', {
            direction: 'downloading',
            loaded: 0,
            total: 0,
            speed: '',
        })
    },

    close({ commit }) {
        commit('reset')

        window.removeEventListener('beforeunload', windowBeforeUnloadFunction)
    },

    updateSourcecode({ commit }, payload) {
        commit('updateSourcecode', payload)
    },
}
