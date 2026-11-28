import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'
import type { PowerDevice, PowerDeviceState } from '@/types/moonraker/DevicesRPC'

export const mutations: MutationTree<ServerPowerState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    setDevices(state, devices: PowerDevice[]): void {
        Vue.set(state, 'devices', devices)
    },

    /** Replaces a device or adds it, if it is unknown (e.g. registered by an extension after init) */
    setDevice(state, device: PowerDevice): void {
        const exists = state.devices.some((entry) => entry.device === device.device)
        const devices = exists
            ? state.devices.map((entry) => (entry.device === device.device ? device : entry))
            : [...state.devices, device]

        Vue.set(state, 'devices', devices)
    },

    setDeviceStatus(state, payload: { device: string; status: PowerDeviceState }): void {
        const devices = state.devices.map((entry) =>
            entry.device === payload.device ? { ...entry, status: payload.status } : entry
        )

        Vue.set(state, 'devices', devices)
    },
}
