import {ActionTree} from 'vuex'
import {EditorState} from '@/store/editor/types'
import {RootState} from '@/store/types'
import axios from 'axios'
import { sha256 } from 'js-sha256'
import Vue from 'vue'
import i18n from '@/plugins/i18n'

export const actions: ActionTree<EditorState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    openFile({ state, dispatch, commit, rootGetters }, payload) {
        const fullFilepath = payload.root+payload.path+'/'+payload.filename
        const url = rootGetters['socket/getUrl'] + '/server/files/' + encodeURI(fullFilepath) + `?${Date.now()}`

        if (state.cancelToken) dispatch('cancelLoad')

        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        commit('updateCancelTokenSource', source)
        commit('updateLoaderState', true)

        commit('setFilename', payload.filename)
        commit('setPermissions', payload.permissions)

        axios.get(url, {
            cancelToken: source.token,
            onDownloadProgress: (progressEvent) => {
                const total = progressEvent.total > 0 ? progressEvent.total : (payload.size ?? 0)

                let speedOutput: string = state.loaderProgress.speed
                let lastTimestamp = state.loaderProgress.lastTimestamp
                let lastLoaded = state.loaderProgress.lastLoaded
                const diffTime = progressEvent.timeStamp - state.loaderProgress.lastTimestamp
                if (diffTime > 500) {
                    const diffData = progressEvent.loaded - lastLoaded
                    let speed = (diffData / diffTime)
                    const unit = ['kB', 'MB', 'GB']
                    let unitSelect = 0
                    while (speed > 1024) {
                        speed /= 1024.0
                        unitSelect = Math.min(2, unitSelect + 1)
                    }
                    speedOutput = speed.toFixed(2) + unit[unitSelect]
                    lastTimestamp = progressEvent.timeStamp
                    lastLoaded = progressEvent.loaded
                }

                this.commit('editor/updateLoader', {
                    direction: 'downloading',
                    speed: speedOutput,
                    loaded: progressEvent.loaded,
                    total,
                    lastLoaded,
                    lastTimestamp
                })
            },
            responseType: 'blob'
        }).then(res => res.data.text())
            .then(file => {
                commit('openFile', {
                    filename: payload.filename,
                    fileroot: payload.root,
                    filepath: payload.path,
                    file
                })
            })
            .finally(() => {
                setTimeout(() => {
                    dispatch('clearLoader')
                }, 100)
            })
    },

    async saveFile({ state, commit, rootGetters, dispatch }, payload: { content: string, restartServiceName: string | null }) {
        const content = new Blob([payload.content], { type: 'text/plain' })
        const formData = new FormData()
        formData.append('file', content, state.filename)
        formData.append('root', state.fileroot)
        formData.append('path', state.filepath.slice(1))
        formData.append('checksum', sha256(payload.content))

        const url = rootGetters['socket/getUrl'] + '/server/files/upload'
        if (state.cancelToken) dispatch('cancelLoad')
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        commit('updateCancelTokenSource', source)
        commit('updateLoaderState', true)

        axios.post(url, formData, {
            cancelToken: source.token,
            onUploadProgress: (progressEvent) => {
                let speedOutput: string = state.loaderProgress.speed
                let lastTimestamp = state.loaderProgress.lastTimestamp
                let lastLoaded = state.loaderProgress.lastLoaded
                const diffTime = progressEvent.timeStamp - state.loaderProgress.lastTimestamp
                if (diffTime > 500) {
                    const diffData = progressEvent.loaded - lastLoaded
                    let speed = (diffData / diffTime)
                    const unit = ['kB', 'MB', 'GB']
                    let unitSelect = 0
                    while (speed > 1024) {
                        speed /= 1024.0
                        unitSelect = Math.min(2, unitSelect + 1)
                    }
                    speedOutput = speed.toFixed(2) + unit[unitSelect]
                    lastTimestamp = progressEvent.timeStamp
                    lastLoaded = progressEvent.loaded
                }

                this.commit('editor/updateLoader', {
                    direction: 'uploading',
                    speed: speedOutput,
                    loaded: progressEvent.loaded,
                    total: progressEvent.total,
                    lastLoaded: lastLoaded,
                    lastTimestamp: lastTimestamp
                })
            }
        }).then(response => {
            return response.data
        }).then(data => {
            dispatch('clearLoader')
            Vue.$toast.success(i18n.t('Editor.SuccessfullySaved', { filename: data.item.path }).toString())
            if (payload.restartServiceName === 'klipper') {
                //dispatch('server/addEvent', { message: 'FIRMWARE_RESTART', type: 'command' })
                Vue.$socket.emit('printer.gcode.script', { script: 'FIRMWARE_RESTART' })
            } else if (payload.restartServiceName !== null) {
                Vue.$socket.emit('machine.services.restart', { service: payload.restartServiceName })
            }
            dispatch('close')
        }).catch(error => {
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
            lastLoaded: 0,
            lastTimestamp: 0,
            loaded: 0,
            total: 0,
            speed: '',
        })
    },

    close({ commit }) {
        commit('reset')
    },

    updateSourcecode({ commit }, payload) {
        commit('updateSourcecode', payload)
    },
}