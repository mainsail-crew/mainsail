import Vue from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { actions } from '@/store/server/firmware/actions'
import { mutations } from '@/store/server/firmware/mutations'
import { getDefaultState } from '@/store/server/firmware'
import type { AldisStatusResponse, AldisUpdateResponse, ServerFirmwareState } from '@/store/server/firmware/types'

type Handler = (context: unknown, payload?: unknown) => unknown

const status = (run: AldisStatusResponse['run'] = null): AldisStatusResponse => ({
    api_version: 1,
    host: { klippy_state: 'ready', klippy_message: 'ready', software_version: 'v0.13.0-770' },
    blocker: null,
    mcus: [],
    run,
})

const event = (overrides: Partial<AldisUpdateResponse> = {}): AldisUpdateResponse => ({
    run_id: 'R',
    mcu: 'can',
    phase: 'flash',
    message: 'flashing',
    complete: false,
    ...overrides,
})

const emitAndWait = vi.fn()
const toastError = vi.fn()

const makeContext = (initial: Partial<ServerFirmwareState> = {}) => {
    const state: ServerFirmwareState = { ...getDefaultState(), ...initial }
    const dispatched: string[] = []
    const context = {
        state,
        getters: {},
        rootState: {},
        rootGetters: {},
        commit: (type: string, payload?: unknown) =>
            (mutations[type] as (s: ServerFirmwareState, p?: unknown) => void)(state, payload),
        dispatch: async (type: string, payload?: unknown) => {
            dispatched.push(type)
            return (actions[type] as Handler)(context, payload)
        },
    }

    return { state, context, dispatched }
}

const run = (name: string, context: unknown, payload?: unknown) => (actions[name] as Handler)(context, payload)

beforeEach(() => {
    // Mainsail logs through window.console; Vitest runs in Node, which has no window.
    vi.stubGlobal('window', { console })
    emitAndWait.mockReset()
    toastError.mockReset()
    Vue.$socket = { emitAndWait } as unknown as typeof Vue.$socket
    Vue.$toast = { error: toastError } as unknown as typeof Vue.$toast
})

describe('refresh', () => {
    it('sets refreshing while the request is in flight and stores the reply', async () => {
        const { state, context } = makeContext()
        let seenWhileInFlight = false
        emitAndWait.mockImplementation(async () => {
            seenWhileInFlight = state.refreshing
            return status()
        })

        await run('refresh', context)

        expect(seenWhileInFlight).toBe(true)
        expect(state.refreshing).toBe(false)
        expect(state.status).toEqual(status())
        expect(emitAndWait).toHaveBeenCalledWith('server.extensions.request', {
            agent: 'aldis',
            method: 'status',
            arguments: null,
        })
    })

    it('does nothing while a refresh is already in flight', async () => {
        const { context } = makeContext({ refreshing: true })
        await run('refresh', context)
        expect(emitAndWait).not.toHaveBeenCalled()
    })

    it('records the unwrapped agent error and clears refreshing on rejection', async () => {
        const { state, context } = makeContext()
        emitAndWait.mockRejectedValue({ code: 424, message: 'Agent aldis RPC error', data: { message: 'boom' } })

        await run('refresh', context)

        expect(state.statusError).toBe('boom')
        expect(state.refreshing).toBe(false)
    })

    it('uses the request-failed text when the socket rejects without an error', async () => {
        const { state, context } = makeContext()
        emitAndWait.mockRejectedValue(undefined)

        await run('refresh', context)

        expect(state.statusError).toBe('Machine.FirmwarePanel.RequestFailed')
    })

    it('can run again after a reset clears a request cut off by a socket drop', async () => {
        const { state, context } = makeContext({ refreshing: true })
        ;(mutations.reset as (s: ServerFirmwareState) => void)(state)
        emitAndWait.mockResolvedValue(status())

        await run('refresh', context)

        expect(emitAndWait).toHaveBeenCalledTimes(1)
    })

    it('runs a queued refresh once the in-flight request completes instead of dropping it', async () => {
        const { state, context } = makeContext()
        const deferred: Array<(value: AldisStatusResponse) => void> = []
        emitAndWait.mockImplementation(
            () =>
                new Promise((resolve) => {
                    deferred.push(resolve)
                })
        )

        const first = run('refresh', context)
        await run('refresh', context)

        expect(emitAndWait).toHaveBeenCalledTimes(1)

        deferred[0](status())
        await vi.waitFor(() => expect(deferred).toHaveLength(2))
        deferred[1](status())
        await first

        expect(emitAndWait).toHaveBeenCalledTimes(2)
        expect(state.refreshing).toBe(false)
    })

    it('runs a queued refresh even when the in-flight request fails', async () => {
        const { state, context } = makeContext()
        emitAndWait.mockRejectedValueOnce({ code: 424, message: 'x', data: { message: 'boom' } })
        emitAndWait.mockResolvedValue(status())

        const first = run('refresh', context)
        await run('refresh', context)
        await first

        expect(emitAndWait).toHaveBeenCalledTimes(2)
        expect(state.statusError).toBeNull()
    })
})

describe('onStatus', () => {
    it('stores a foreign api version as unsupported without an error', async () => {
        const { state, context } = makeContext()
        await run('onStatus', context, { api_version: 2 })
        expect(state.status?.api_version).toBe(2)
        expect(state.statusError).toBeNull()
    })

    it('reports a malformed status', async () => {
        const { state, context } = makeContext()
        await run('onStatus', context, { api_version: 1, host: {}, mcus: [{}] })
        expect(state.statusError).toBe('Machine.FirmwarePanel.MalformedStatus')
    })

    it('retries exactly once when a completed run is still reported running', async () => {
        const stale = status({ run_id: 'R', state: 'running', messages: [], result: null })
        const { state, context } = makeContext({ runId: 'R', busy: false })
        emitAndWait.mockResolvedValue(stale)

        await run('onStatus', context, stale)

        expect(emitAndWait).toHaveBeenCalledTimes(1)
        expect(state.retried).toBe(true)
    })

    it('hydrates a running run after a reset', async () => {
        const { state, context } = makeContext()
        await run('onStatus', context, status({ run_id: 'R', state: 'running', messages: [event()], result: null }))
        expect(state.busy).toBe(true)
        expect(state.runId).toBe('R')
        expect(state.responses).toHaveLength(1)
    })

    it('rehydrates the first status after a socket reconnect resets the module mid-run', async () => {
        const { state, context } = makeContext({
            runId: 'R',
            busy: true,
            responses: [{ id: 0, date: new Date(), message: 'can: old', mcu: 'can', phase: 'flash' }],
        })

        ;(mutations.reset as (s: ServerFirmwareState) => void)(state)
        expect(state.runId).toBeNull()
        expect(state.busy).toBe(false)
        expect(state.responses).toEqual([])

        await run(
            'onStatus',
            context,
            status({
                run_id: 'R2',
                state: 'running',
                messages: [event({ run_id: 'R2', message: 'new run' })],
                result: null,
            })
        )

        expect(state.runId).toBe('R2')
        expect(state.busy).toBe(true)
        expect(state.responses.map((line) => line.message)).toEqual(['can: new run'])
    })
})

describe('update', () => {
    it('opens a run and adopts the returned run id', async () => {
        const { state, context } = makeContext({
            responses: [{ id: 0, date: new Date(), message: 'old', mcu: null, phase: 'done' }],
        })
        emitAndWait.mockResolvedValue({ run_id: 'R' })

        await run('update', context, { mcus: ['can'] })

        expect(state.busy).toBe(true)
        expect(state.runId).toBe('R')
        expect(state.responses).toEqual([])
        expect(emitAndWait).toHaveBeenCalledWith('server.extensions.request', {
            agent: 'aldis',
            method: 'update',
            arguments: { mcus: ['can'] },
        })
    })

    it('closes the run, toasts, and refreshes on a malformed reply instead of leaving it busy forever', async () => {
        const { state, context, dispatched } = makeContext()
        emitAndWait.mockResolvedValueOnce({})
        emitAndWait.mockResolvedValue(status())

        await run('update', context, { mcus: ['can'] })

        expect(state.busy).toBe(false)
        expect(state.runId).toBeNull()
        expect(toastError).toHaveBeenCalledWith('Machine.FirmwarePanel.MalformedStatus')
        expect(dispatched).toContain('refresh')
    })

    it('closes the run, toasts, and refreshes on rejection', async () => {
        const { state, context, dispatched } = makeContext()
        emitAndWait.mockRejectedValueOnce({ code: 424, message: 'x', data: { message: 'update already running' } })
        emitAndWait.mockResolvedValue(status())

        await run('update', context, { mcus: ['can'] })

        expect(state.busy).toBe(false)
        expect(toastError).toHaveBeenCalledWith('update already running')
        expect(dispatched).toContain('refresh')
    })

    it('ignores a second update while one is already busy', async () => {
        const { state, context } = makeContext({ busy: true, runId: 'R' })
        emitAndWait.mockResolvedValue({ run_id: 'R2' })

        await run('update', context, { mcus: ['mcu'] })

        expect(emitAndWait).not.toHaveBeenCalled()
        expect(state.runId).toBe('R')
    })
})

describe('agent events', () => {
    it('ignores foreign events and malformed payloads', async () => {
        const { state, context } = makeContext()
        await run('onAgentEvent', context, { agent: 'aldis', event: 'other', data: event() })
        await run('onAgentEvent', context, { agent: 'aldis', event: 'update_response', data: {} })
        expect(state.responses).toEqual([])
    })

    it('appends lines and refreshes on completion', async () => {
        const { state, context, dispatched } = makeContext({ runId: 'R', busy: true })
        emitAndWait.mockResolvedValue(status())

        await run('onAgentEvent', context, { agent: 'aldis', event: 'update_response', data: event() })
        expect(dispatched).not.toContain('refresh')

        await run('onAgentEvent', context, {
            agent: 'aldis',
            event: 'update_response',
            data: event({ complete: true, message: 'done' }),
        })
        expect(state.responses).toHaveLength(2)
        expect(state.busy).toBe(false)
        expect(dispatched).toContain('refresh')
    })

    it('ends a busy run with the lost-run line when the agent disconnects, and keeps it through re-init', async () => {
        const { state, context } = makeContext({ initialised: true, runId: 'R', busy: true, refreshing: true })

        await run('onAgentDisconnected', context)
        expect(state.initialised).toBe(false)
        expect(state.refreshing).toBe(false)
        expect(state.busy).toBe(false)
        expect(state.responses.map((line) => line.message)).toEqual(['App.FirmwareDialog.LostRun'])
        expect(state.lastMessage).toBe('App.FirmwareDialog.LostRun')

        emitAndWait.mockResolvedValue(status())
        await run('init', context)
        expect(state.initialised).toBe(true)
        expect(state.responses).toHaveLength(1)
    })

    it('refreshes on Klippy state changes only once initialised', async () => {
        emitAndWait.mockResolvedValue(status())
        const fresh = makeContext()
        await run('onKlippyStateChanged', fresh.context)
        expect(emitAndWait).not.toHaveBeenCalled()

        const ready = makeContext({ initialised: true })
        await run('onKlippyStateChanged', ready.context)
        expect(emitAndWait).toHaveBeenCalledTimes(1)
    })
})
