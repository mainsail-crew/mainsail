import { describe, expect, it } from 'vitest'
import { mutations } from '@/store/server/power/mutations'
import { getDefaultState } from '@/store/server/power'
import { powerDevice } from './fixtures'

describe('server/power/mutations', () => {
    it('starts without devices', () => {
        expect(getDefaultState().devices).toEqual([])
    })

    it('sets the devices', () => {
        const state = getDefaultState()
        const devices = [powerDevice('printer')]

        mutations.setDevices(state, devices)

        expect(state.devices).toBe(devices)
    })

    it('replaces a known device without mutating the old entry', () => {
        const state = getDefaultState()
        const printer = powerDevice('printer')
        mutations.setDevices(state, [printer, powerDevice('light')])
        const changed = powerDevice('printer', 'on')

        mutations.setDevice(state, changed)

        expect(state.devices[0]).toBe(changed)
        expect(printer.status).toBe('off')
    })

    it('adds an unknown device', () => {
        const state = getDefaultState()
        mutations.setDevices(state, [powerDevice('printer')])

        mutations.setDevice(state, powerDevice('light'))

        expect(state.devices.map((device) => device.device)).toEqual(['printer', 'light'])
    })

    it('sets the status of a device without mutating the old entry', () => {
        const state = getDefaultState()
        const printer = powerDevice('printer')
        mutations.setDevices(state, [printer, powerDevice('light')])

        mutations.setDeviceStatus(state, { device: 'printer', status: 'on' })

        expect(state.devices.map((device) => device.status)).toEqual(['on', 'off'])
        expect(printer.status).toBe('off')
    })

    it('ignores the status of an unknown device', () => {
        const state = getDefaultState()
        mutations.setDevices(state, [powerDevice('printer')])

        mutations.setDeviceStatus(state, { device: 'light', status: 'on' })

        expect(state.devices).toEqual([powerDevice('printer')])
    })

    it('resets the state', () => {
        const state = getDefaultState()
        mutations.setDevices(state, [powerDevice('printer')])

        mutations.reset(state, undefined)

        expect(state).toEqual(getDefaultState())
    })
})
