import { describe, expect, it } from 'vitest'
import { getters } from '@/store/server/firmware/getters'
import { getDefaultState } from '@/store/server/firmware'
import type { AldisStatusResponse, ServerFirmwareState } from '@/store/server/firmware/types'
import type { RootState } from '@/store/types'

type GetterFn = (state: unknown, getters: unknown, rootState: unknown, rootGetters: unknown) => unknown

const status: AldisStatusResponse = {
    api_version: 1,
    host: { klippy_state: 'ready', klippy_message: 'ready', software_version: 'v0.13.0-770' },
    blocker: null,
    mcus: [
        {
            name: 'can',
            transport: null,
            running_version: 'v0.13.0-753',
            state: 'update_available',
            message: 'behind',
            actions: ['update'],
        },
    ],
    run: null,
}

const evaluate = (state: Partial<ServerFirmwareState>, connected: boolean, services: string[] = []) => {
    const fullState = { ...getDefaultState(), ...state }
    const rootState = { server: { system_info: { available_services: services } } } as unknown as RootState
    const rootGetters = { 'server/agentSupport': (name: string) => connected && name === 'aldis' }
    const resolved: Record<string, unknown> = {}

    Object.keys(getters).forEach((name) => {
        Object.defineProperty(resolved, name, {
            get: () => (getters[name] as GetterFn)(fullState, resolved, rootState, rootGetters),
        })
    })

    return resolved
}

describe('firmware getters', () => {
    it('reports support from the connected agent list and registration from services', () => {
        expect(evaluate({}, true).isSupported).toBe(true)
        expect(evaluate({}, false).isSupported).toBe(false)
        expect(evaluate({}, false, ['aldis']).isRegistered).toBe(true)
        expect(evaluate({}, false, ['klipper']).isRegistered).toBe(false)
    })

    it('is loading only while the first status is in flight', () => {
        expect(evaluate({ refreshing: true }, true).isLoading).toBe(true)
        expect(evaluate({ refreshing: true, status }, true).isLoading).toBe(false)
        expect(evaluate({ refreshing: false }, true).isLoading).toBe(false)
    })

    it('has updates only while the agent is connected', () => {
        expect(evaluate({ status }, true).hasUpdates).toBe(true)
        expect(evaluate({ status }, true).getUpdatableMcus).toEqual(['can'])
        expect(evaluate({ status }, false).hasUpdates).toBe(false)
    })

    it('has no updates under a blocker or an unsupported API', () => {
        expect(
            evaluate({ status: { ...status, blocker: { reason: 'printing', message: 'x' } } }, true).hasUpdates
        ).toBe(false)
        const foreign = evaluate({ status: { ...status, api_version: 2 } }, true)
        expect(foreign.isApiSupported).toBe(false)
        expect(foreign.hasUpdates).toBe(false)
        expect(foreign.getMcus).toEqual([])
    })
})
