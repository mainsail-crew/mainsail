import { ActionTree, Commit } from 'vuex'
import { EditorOpenFilePayload, EditorState } from '@/store/editor/types'
import { RootState } from '@/store/types'
import axios, { AxiosProgressEvent } from 'axios'
import { sha256 } from 'js-sha256'
import Vue from 'vue'
import i18n from '@/plugins/i18n'
import { escapePath, formatFilesize, hashEditorContent } from '@/plugins/helpers'

const LOG_PREFIX = '[EDITOR]'
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

type RequestType = 'download' | 'upload'
// Kept outside of Vuex state: AbortController is not serializable and doesn't need reactivity.
const controllers: Record<RequestType, AbortController | null> = { download: null, upload: null }

const startRequest = (commit: Commit, type: RequestType): AbortController => {
    controllers[type]?.abort()
    const controller = new AbortController()
    controllers[type] = controller
    commit('updateLoaderState', true)
    return controller
}

const isCurrentRequest = (type: RequestType, controller: AbortController): boolean => controllers[type] === controller

const abortRequest = (type: RequestType): void => {
    controllers[type]?.abort()
    controllers[type] = null
}

const finishRequest = (commit: Commit, type: RequestType, controller: AbortController): void => {
    if (!isCurrentRequest(type, controller)) return

    controllers[type] = null
    if (!controllers.download && !controllers.upload) commit('resetLoader')
}

export const actions: ActionTree<EditorState, RootState> = {
    reset({ commit, dispatch }): void {
        dispatch('cancelLoad')
        commit('reset')
    },

    updateProgress(
        { commit },
        payload: {
            progressEvent: AxiosProgressEvent
            direction: EditorState['loaderProgress']['direction']
            filesize: number | null
        }
    ): void {
        commit('updateLoader', {
            direction: payload.direction,
            speed: formatFilesize(payload.progressEvent.rate ?? 0),
            loaded: payload.progressEvent.loaded,
            total: payload.filesize ?? payload.progressEvent.total,
        })
    },

    async openFile({ dispatch, commit, rootGetters }, payload: EditorOpenFilePayload): Promise<void> {
        const fullFilepathArray = [payload.root]
        const path = payload.path.replace(/^\/+|\/+$/g, '')
        if (path !== '') fullFilepathArray.push(path)
        fullFilepathArray.push(payload.filename)

        const fullFilepath = fullFilepathArray.join('/')
        const url = `${rootGetters['socket/getUrl']}/server/files/${escapePath(fullFilepath)}?${Date.now()}`
        const controller = startRequest(commit, 'download')

        commit('setFilename', payload.filename)

        try {
            const response = await axios.get<Blob>(url, {
                signal: controller.signal,
                onDownloadProgress: (progressEvent): Promise<void> =>
                    dispatch('updateProgress', {
                        progressEvent,
                        direction: 'downloading',
                        filesize: payload.size,
                    }),
                responseType: 'blob',
            })

            const content = await response.data.text()
            if (!isCurrentRequest('download', controller)) return

            commit('openFile', {
                filename: payload.filename,
                fileroot: payload.root,
                permissions: payload.permissions,
                filepath: path,
                file: content,
            })
        } catch (error) {
            if (axios.isCancel(error)) return

            logError(error)
            Vue.$toast.error(i18n.t('Editor.FailedLoad', { filename: payload.filename }).toString())
        } finally {
            finishRequest(commit, 'download', controller)
        }
    },

    async saveFile(
        { state, commit, dispatch, rootGetters, rootState },
        payload: { content: string; restartServiceName: string | null }
    ): Promise<void> {
        const { filename, fileroot, filepath } = state

        const content = new Blob([payload.content], { type: 'text/plain' })
        const formData = new FormData()
        formData.append('file', content, filename)
        formData.append('root', fileroot)
        formData.append('path', filepath)
        formData.append('checksum', sha256(payload.content))

        const url = rootGetters['socket/getUrl'] + '/server/files/upload'
        const controller = startRequest(commit, 'upload')

        try {
            const response = await axios.post<{ item: { path: string } }>(url, formData, {
                signal: controller.signal,
                onUploadProgress: (progressEvent) =>
                    dispatch('updateProgress', {
                        progressEvent,
                        direction: 'uploading',
                        filesize: null,
                    }),
            })
            if (!isCurrentRequest('upload', controller)) return

            Vue.$toast.success(i18n.t('Editor.SuccessfullySaved', { filename: response.data.item.path }).toString())

            if (payload.restartServiceName === 'klipper') {
                const klipperRestartMethod = rootState.gui?.editor?.klipperRestartMethod ?? 'FIRMWARE_RESTART'
                Vue.$socket.emit('printer.gcode.script', { script: klipperRestartMethod })
            } else if (payload.restartServiceName === 'moonraker') {
                Vue.$socket.emit('server.restart', {})
            } else if (payload.restartServiceName !== null) {
                Vue.$socket.emit('machine.services.restart', { service: payload.restartServiceName })
            }

            commit('updateLoadedHash', hashEditorContent(payload.content))

            if (payload.restartServiceName !== null) dispatch('close')
        } catch (error) {
            if (axios.isCancel(error)) return

            logError(error)
            Vue.$toast.error(i18n.t('Editor.FailedSave', { filename }).toString())
        } finally {
            finishRequest(commit, 'upload', controller)
        }
    },

    cancelLoad({ commit }): void {
        if (!controllers.download && !controllers.upload) return

        abortRequest('download')
        abortRequest('upload')
        commit('resetLoader')
    },

    close({ state, commit }): void {
        abortRequest('download')

        const { filename, loaderProgress } = state
        commit('reset')

        if (!controllers.upload) return

        commit('setFilename', filename)
        commit('updateLoaderState', true)
        commit('updateLoader', loaderProgress)
    },

    updateSourcecode({ commit }, content: string): void {
        commit('updateSourcecode', content)
    },
}
