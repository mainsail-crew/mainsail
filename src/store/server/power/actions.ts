import Vue from 'vue'
import { ActionTree } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'
import { RootState } from '@/store/types'
import { isJsonRpcError } from '@/types/moonraker'
import type { PowerChangedNotification, PowerDeviceAction } from '@/types/moonraker/DevicesRPC'

const LOG_PREFIX = '[Server][Power]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

export const actions: ActionTree<ServerPowerState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async init({ commit, dispatch }): Promise<void> {
        logDebug('init')

        try {
            const response = await Vue.$socket.emitAndWait('machine.device_power.devices')

            commit('setDevices', response.devices)
        } catch (error) {
            // connection loss, timeouts etc. are handled by server/init
            if (!isJsonRpcError(error)) throw error

            // Moonraker answered with an error: the component is optional, so report it instead of failing the init
            logError('Failed to initialize power devices:', error)
            await dispatch('server/addFailedInitComponent', 'power', { root: true })
        }
    },

    notifyPowerChanged({ commit }, payload: PowerChangedNotification): void {
        commit('setDevice', payload)
    },

    /** Turns a device on or off, or toggles it. Rejects if the device is locked while printing. */
    async setDeviceState({ commit }, payload: { device: string; action: PowerDeviceAction }): Promise<void> {
        const response = await Vue.$socket.emitAndWait('machine.device_power.post_device', payload)

        const status = response[payload.device]
        if (status) commit('setDeviceStatus', { device: payload.device, status })
    },
}
