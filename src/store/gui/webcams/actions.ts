import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { GuiWebcamState } from '@/store/gui/webcams/types'
import Vue from 'vue'
import i18n from '@/plugins/i18n'
import { Webcam, WebcamIdentifier, WebcamPostParams } from '@/types/moonraker/WebcamRPC'

const LOG_PREFIX = '[GUI][Webcams]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

export const actions: ActionTree<GuiWebcamState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async init({ commit, dispatch }): Promise<void> {
        logDebug('init')
        commit('reset')

        dispatch('socket/setInitializationStep', i18n.t('ConnectionDialog.InitComponents.Webcams').toString(), {
            root: true,
        })

        try {
            const response = await Vue.$socket.emitAndWait('server.webcams.list')
            dispatch('notifyWebcamsChanged', response)
        } catch (error) {
            logError('Failed to initialize webcams:', error)
        }
    },

    notifyWebcamsChanged({ commit }, payload: { webcams: Webcam[] }): void {
        commit('setWebcams', payload.webcams)
    },

    async store({ dispatch, rootState }, payload: { webcam: WebcamPostParams; oldWebcamName?: string }): Promise<void> {
        const { webcam, oldWebcamName } = payload
        const response = await Vue.$socket.emitAndWait('server.webcams.post_item', webcam)

        // stop here, when the name didn't change and/or it's a new webcam
        if (!oldWebcamName || oldWebcamName === response.webcam.name) return

        // Moonraker < 0.9.0 has no uid, so a rename created a second entry instead of
        // updating the existing one. Remove the leftover entry under the old name.
        if (!('uid' in webcam)) await dispatch('delete', { name: oldWebcamName })

        // check if timelapse plugin is active, if not stop here
        if (!rootState.server?.components.includes('timelapse')) return

        dispatch(
            'server/timelapse/updateCamSettings',
            { newName: response.webcam.name, oldName: oldWebcamName },
            { root: true }
        )
    },

    async delete(_, identifier: WebcamIdentifier): Promise<void> {
        await Vue.$socket.emitAndWait('server.webcams.delete_item', identifier)
    },
}
