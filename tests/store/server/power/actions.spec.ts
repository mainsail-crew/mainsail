import { beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import { getDefaultState, power } from '@/store/server/power'
import type { ServerPowerState } from '@/store/server/power/types'
import type { PowerDevice } from '@/types/moonraker/DevicesRPC'
import { WebSocketClosedError } from '@/plugins/jsonRpcSocket'
import { powerDevice } from './fixtures'

Vue.use(Vuex)

type Responder = (params: Record<string, unknown>) => unknown

/** Minimal fake of Moonraker's power component */
let devices: PowerDevice[]

let responders: Record<string, Responder>
const emitAndWait = vi.fn<(method: string, params?: Record<string, unknown>, options?: unknown) => Promise<unknown>>(
    async (method, params = {}) => {
        const responder = responders[method]
        if (!responder) throw { code: -32601, message: `Method not found: ${method}` }

        return responder(params)
    }
)
const windowStub = { console: { error: vi.fn(), debug: vi.fn() } }
const addFailedInitComponent = vi.fn()

const createStore = () =>
    new Store({
        actions: {
            'server/addFailedInitComponent': (_, component: string) => addFailedInitComponent(component),
        },
        modules: {
            power: { ...power, state: getDefaultState() },
        },
    })

const powerState = (store: Store<unknown>) => (store.state as { power: ServerPowerState }).power

describe('server/power/actions', () => {
    beforeEach(() => {
        emitAndWait.mockClear()
        addFailedInitComponent.mockClear()
        windowStub.console.error.mockClear()
        Vue.$socket = { emitAndWait } as unknown as typeof Vue.$socket
        vi.stubGlobal('window', windowStub)

        devices = [powerDevice('printer'), powerDevice('light', 'on')]

        responders = {
            'machine.device_power.devices': () => ({ devices: devices.map((device) => ({ ...device })) }),
            'machine.device_power.post_device': (params) => {
                const device = devices.find((entry) => entry.device === params.device)
                if (!device) throw { code: 400, message: `No valid device named ${params.device}` }

                if (params.action === 'toggle') device.status = device.status === 'off' ? 'on' : 'off'
                else device.status = params.action as PowerDevice['status']

                return { [device.device]: device.status }
            },
        }
    })

    describe('init', () => {
        it('loads the devices', async () => {
            const store = createStore()

            await store.dispatch('power/init')

            expect(powerState(store).devices).toEqual(devices)
        })

        it('reports a failed init component when Moonraker answers with an error', async () => {
            responders = {}
            const store = createStore()

            await expect(store.dispatch('power/init')).resolves.toBeUndefined()
            expect(powerState(store).devices).toEqual([])
            expect(windowStub.console.error).toHaveBeenCalled()
            expect(addFailedInitComponent).toHaveBeenCalledWith('power')
        })

        it('propagates non RPC errors to the caller', async () => {
            responders['machine.device_power.devices'] = () => {
                throw new WebSocketClosedError()
            }
            const store = createStore()

            await expect(store.dispatch('power/init')).rejects.toBeInstanceOf(WebSocketClosedError)
            expect(addFailedInitComponent).not.toHaveBeenCalled()
        })
    })

    describe('notifyPowerChanged', () => {
        it('replaces the changed device', async () => {
            const store = createStore()
            await store.dispatch('power/init')
            const changed = { ...powerDevice('printer', 'on'), locked_while_printing: true }

            await store.dispatch('power/notifyPowerChanged', changed)

            expect(powerState(store).devices).toEqual([changed, devices[1]])
        })

        it('adds an unknown device', async () => {
            const store = createStore()
            await store.dispatch('power/init')
            const added = powerDevice('fan', 'init')

            await store.dispatch('power/notifyPowerChanged', added)

            expect(powerState(store).devices.map((device) => device.device)).toEqual(['printer', 'light', 'fan'])
        })
    })

    describe('setDeviceState', () => {
        it('sends the action and updates the device status', async () => {
            const store = createStore()
            await store.dispatch('power/init')

            await store.dispatch('power/setDeviceState', { device: 'printer', action: 'on' })

            expect(emitAndWait).toHaveBeenLastCalledWith('machine.device_power.post_device', {
                device: 'printer',
                action: 'on',
            })
            expect(powerState(store).devices.map((device) => device.status)).toEqual(['on', 'on'])
        })

        it('updates the status with the toggled state from the response', async () => {
            const store = createStore()
            await store.dispatch('power/init')

            await store.dispatch('power/setDeviceState', { device: 'light', action: 'toggle' })

            expect(powerState(store).devices[1].status).toBe('off')
        })

        it('propagates errors to the caller and keeps the state', async () => {
            const store = createStore()
            await store.dispatch('power/init')
            responders['machine.device_power.post_device'] = () => {
                throw { code: 400, message: 'Unable to change power for printer while printing' }
            }

            await expect(store.dispatch('power/setDeviceState', { device: 'printer', action: 'on' })).rejects.toEqual({
                code: 400,
                message: 'Unable to change power for printer while printing',
            })
            expect(powerState(store).devices[0].status).toBe('off')
        })
    })
})
