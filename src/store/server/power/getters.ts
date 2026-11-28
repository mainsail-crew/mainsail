import { GetterTree } from 'vuex'
import { ServerPowerState } from '@/store/server/power/types'
import { RootState } from '@/store/types'
import type { PowerDevice } from '@/types/moonraker/DevicesRPC'

/** Devices with a leading underscore are hidden in the UI, like hidden objects in Klipper */
const isHiddenDevice = (device: PowerDevice): boolean => device.device.startsWith('_')

export const getters: GetterTree<ServerPowerState, RootState> = {
    visibleDevices: (state): PowerDevice[] => state.devices.filter((device) => !isHiddenDevice(device)),

    getDevice:
        (state) =>
        (name: string): PowerDevice | null =>
            state.devices.find((device) => device.device === name) ?? null,

    /** The device that is used for the printer, if no device is selected in the UI settings */
    autoPrinterDevice: (state): PowerDevice | null =>
        state.devices.find((device) => device.device.toLowerCase() === 'printer') ?? null,
}
