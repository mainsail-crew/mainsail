import { ActionTree } from 'vuex'
import { EditorOpenFilePayload, EditorState } from '@/store/editor/types'
import { editorRequests } from './requestTracker'
import { RootState } from '@/store/types'
import axios from 'axios'
import { sha256 } from 'js-sha256'
import Vue from 'vue'
import i18n from '@/plugins/i18n'
import { escapePath, formatFilesize, hashEditorContent } from '@/plugins/helpers'

const LOG_PREFIX = '[EDITOR]'
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

export const actions: ActionTree<EditorState, RootState> = {
    reset({ commit, dispatch }): void {
        dispatch('cancelLoad')
        commit('reset')
    },

    async openFile({ commit, rootGetters }, payload: EditorOpenFilePayload): Promise<void> {
        const fullFilepathArray = [payload.root]
        const path = payload.path.replace(/^\/+|\/+$/g, '')
        if (path !== '') fullFilepathArray.push(path)
        fullFilepathArray.push(payload.filename)

        const fullFilepath = fullFilepathArray.join('/')
        const url = `${rootGetters['socket/getUrl']}/server/files/${escapePath(fullFilepath)}?${Date.now()}`
        const controller = editorRequests.start('download')
        commit('startLoader', { direction: 'downloading', filename: payload.filename })

        try {
            const response = await axios.get<Blob>(url, {
                signal: controller.signal,
                onDownloadProgress: (progressEvent): void =>
                    commit('updateLoaderProgress', {
                        loaded: progressEvent.loaded,
                        speed: formatFilesize(progressEvent.rate ?? 0),
                        total: payload.size ?? 0,
                    }),
                responseType: 'blob',
            })

            const content = await response.data.text()
            if (!editorRequests.isCurrent('download', controller)) return

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
            if (editorRequests.finish('download', controller) && !editorRequests.isActive()) {
                commit('resetLoader')
            }
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
        const controller = editorRequests.start('upload')
        commit('startLoader', { direction: 'uploading', filename })

        try {
            const response = await axios.post<{ item: { path: string } }>(url, formData, {
                signal: controller.signal,
                onUploadProgress: (progressEvent) =>
                    commit('updateLoaderProgress', {
                        loaded: progressEvent.loaded,
                        speed: formatFilesize(progressEvent.rate ?? 0),
                        total: progressEvent.total ?? 0,
                    }),
            })
            if (!editorRequests.isCurrent('upload', controller)) return

            Vue.$toast.success(i18n.t('Editor.SuccessfullySaved', { filename: response.data.item.path }).toString())

            if (payload.restartServiceName === 'klipper') {
                const klipperRestartMethod = rootState.gui?.editor?.klipperRestartMethod ?? 'FIRMWARE_RESTART'
                Vue.$socket.emit('printer.gcode.script', { script: klipperRestartMethod })
            } else if (payload.restartServiceName === 'moonraker') {
                Vue.$socket.emit('server.restart', {})
            } else if (payload.restartServiceName !== null) {
                Vue.$socket.emit('machine.services.restart', { service: payload.restartServiceName })
            }

            // The editor may have been closed or switched to another file while uploading
            if (state.filename === filename && state.fileroot === fileroot && state.filepath === filepath) {
                commit('updateLoadedHash', hashEditorContent(payload.content))
            }

            if (payload.restartServiceName !== null) dispatch('close')
        } catch (error) {
            if (axios.isCancel(error)) return

            logError(error)
            Vue.$toast.error(i18n.t('Editor.FailedSave', { filename }).toString())
        } finally {
            if (editorRequests.finish('upload', controller) && !editorRequests.isActive()) {
                commit('resetLoader')
            }
        }
    },

    cancelLoad({ commit }): void {
        if (!editorRequests.isActive()) return

        editorRequests.abortAll()
        commit('resetLoader')
    },

    close({ commit }): void {
        editorRequests.abort('download')
        commit('closeEditor')
        if (!editorRequests.isActive()) commit('resetLoader')
    },

    updateSourcecode({ commit }, content: string): void {
        commit('updateSourcecode', content)
    },
}
