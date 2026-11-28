import { describe, expect, it } from 'vitest'
import { getters } from '@/store/server/power/getters'
import type { ServerPowerState } from '@/store/server/power/types'
import type { RootState } from '@/store/types'
import type { PowerDevice } from '@/types/moonraker/DevicesRPC'
import { powerDevice } from './fixtures'

const callGetter = <T>(name: string, devices: PowerDevice[]): T => {
    const state: ServerPowerState = { devices }

    return getters[name](state, {}, {} as RootState, {}) as T
}

describe('server/power/getters', () => {
    const devices = [powerDevice('Printer'), powerDevice('_hidden'), powerDevice('light')]

    it('hides devices with a leading underscore', () => {
        const visible = callGetter<PowerDevice[]>('visibleDevices', devices)

        expect(visible.map((device) => device.device)).toEqual(['Printer', 'light'])
    })

    it('finds a device by name and returns null for unknown devices', () => {
        const getDevice = callGetter<(name: string) => PowerDevice | null>('getDevice', devices)

        expect(getDevice('light')).toBe(devices[2])
        expect(getDevice('unknown')).toBeNull()
    })

    it('detects the printer device case-insensitively', () => {
        expect(callGetter<PowerDevice | null>('autoPrinterDevice', devices)).toBe(devices[0])
        expect(callGetter<PowerDevice | null>('autoPrinterDevice', [powerDevice('light')])).toBeNull()
    })
})
