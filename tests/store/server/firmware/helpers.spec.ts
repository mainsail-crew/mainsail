import { describe, expect, it } from 'vitest'
import {
    agentErrorMessage,
    agentErrorReason,
    apiVersionOf,
    applyEvent,
    firmwareDialogVisible,
    formatResponse,
    isStatusResponse,
    isUpdateResponse,
    isUpdateResult,
    needsRetry,
    reconcileRun,
    unsupportedStatus,
    updatableMcus,
} from '@/store/server/firmware/helpers'
import type {
    AldisMcu,
    AldisRun,
    AldisRunResult,
    AldisStatusResponse,
    AldisUpdateResponse,
    FirmwareRunState,
} from '@/store/server/firmware/types'

const emptyRun = (): FirmwareRunState => ({
    busy: false,
    runId: null,
    responses: [],
    lastResult: null,
    lastMessage: null,
})

const failed: AldisRunResult = {
    outcome: 'failed',
    klippy_state: 'disconnected',
    klipper_left_stopped: true,
    mcus: [{ name: 'can', outcome: 'failed', message: 'flash failed' }],
}

const event = (overrides: Partial<AldisUpdateResponse> = {}): AldisUpdateResponse => ({
    run_id: 'R',
    mcu: 'can',
    phase: 'flash',
    message: 'flashing',
    complete: false,
    ...overrides,
})

const mcu = (overrides: Partial<AldisMcu> = {}): AldisMcu => ({
    name: 'can',
    transport: { type: 'can', interface: 'can0', uuid: 'e7819ed8e7d3' },
    running_version: 'v0.13.0-753',
    state: 'update_available',
    message: 'behind',
    actions: ['update'],
    ...overrides,
})

const status = (overrides: Partial<AldisStatusResponse> = {}): AldisStatusResponse => ({
    api_version: 1,
    host: { klippy_state: 'ready', klippy_message: 'ready', software_version: 'v0.13.0-770' },
    blocker: null,
    mcus: [mcu()],
    run: null,
    ...overrides,
})

const running = (messages: AldisUpdateResponse[] = [event()]): AldisRun => ({
    run_id: 'R',
    state: 'running',
    messages,
    result: null,
})

describe('formatResponse', () => {
    it('prefixes the MCU name when present', () => {
        const line = formatResponse(event(), 3)
        expect(line).toMatchObject({ id: 3, message: 'can: flashing', mcu: 'can', phase: 'flash' })
        expect(line.date).toBeInstanceOf(Date)
    })

    it('keeps the message alone without an MCU', () => {
        expect(formatResponse(event({ mcu: null, message: 'stopping Klipper' }), 0).message).toBe('stopping Klipper')
    })
})

describe('applyEvent', () => {
    it('appends a line with the next id', () => {
        const next = applyEvent({ ...emptyRun(), runId: 'R', busy: true }, event())
        expect(next.responses.map((line) => line.id)).toEqual([0])
        expect(next.busy).toBe(true)
    })

    it('adopts the run id and sets busy when no run is known', () => {
        const next = applyEvent(emptyRun(), event())
        expect(next.runId).toBe('R')
        expect(next.busy).toBe(true)
    })

    it('stores the result and final message on completion', () => {
        const next = applyEvent(
            { ...emptyRun(), runId: 'R', busy: true },
            event({ complete: true, message: 'done, see logs/aldis/run.log', result: failed })
        )
        expect(next.busy).toBe(false)
        expect(next.lastResult).toEqual(failed)
        expect(next.lastMessage).toBe('done, see logs/aldis/run.log')
    })

    it('switches to a new run when a different run_id arrives while not busy', () => {
        const stale: FirmwareRunState = {
            busy: false,
            runId: 'R',
            responses: [{ id: 0, date: new Date(), message: 'can: old', mcu: 'can', phase: 'flash' }],
            lastResult: failed,
            lastMessage: 'old run done',
        }

        const next = applyEvent(stale, event({ run_id: 'R2', message: 'starting' }))

        expect(next.runId).toBe('R2')
        expect(next.busy).toBe(true)
        expect(next.responses).toEqual([
            { id: 0, date: expect.any(Date), message: 'can: starting', mcu: 'can', phase: 'flash' },
        ])
        expect(next.lastResult).toBeNull()
        expect(next.lastMessage).toBeNull()
    })

    it('keeps following its own run when a different run_id arrives while still busy', () => {
        const next = applyEvent({ ...emptyRun(), runId: 'R', busy: true }, event({ run_id: 'R2' }))

        expect(next.runId).toBe('R')
        expect(next.responses).toHaveLength(1)
    })
})

describe('reconcileRun', () => {
    it('leaves state alone while a run is followed', () => {
        const state = { ...emptyRun(), runId: 'R', busy: true }
        expect(reconcileRun(state, running())).toBe(state)
    })

    it('leaves state alone for a null run', () => {
        const state = emptyRun()
        expect(reconcileRun(state, null)).toBe(state)
    })

    it('hydrates a running run', () => {
        const next = reconcileRun(emptyRun(), running([event({ message: 'a' }), event({ message: 'b' })]))
        expect(next.busy).toBe(true)
        expect(next.runId).toBe('R')
        expect(next.responses.map((line) => line.message)).toEqual(['can: a', 'can: b'])
        expect(next.responses.map((line) => line.id)).toEqual([0, 1])
    })

    it('fills the last result from a finished run without touching the log', () => {
        const finished: AldisRun = {
            run_id: 'R',
            state: 'finished',
            messages: [event(), event({ complete: true, message: 'final', result: failed })],
            result: failed,
        }
        const next = reconcileRun(emptyRun(), finished)
        expect(next.lastResult).toEqual(failed)
        expect(next.lastMessage).toBe('final')
        expect(next.responses).toEqual([])
        expect(next.busy).toBe(false)
    })
})

describe('needsRetry', () => {
    it('is true when the followed run is complete but reported running', () => {
        expect(needsRetry({ ...emptyRun(), runId: 'R', busy: false }, running())).toBe(true)
    })

    it('is false while the run is still busy, for other runs, and for finished runs', () => {
        expect(needsRetry({ ...emptyRun(), runId: 'R', busy: true }, running())).toBe(false)
        expect(needsRetry({ ...emptyRun(), runId: 'X', busy: false }, running())).toBe(false)
        expect(needsRetry({ ...emptyRun(), runId: 'R' }, { ...running(), state: 'finished' })).toBe(false)
    })
})

describe('updatableMcus', () => {
    it('lists MCUs in update_available with the update action', () => {
        expect(updatableMcus(status({ mcus: [mcu(), mcu({ name: 'mcu', state: 'current', actions: [] })] }))).toEqual([
            'can',
        ])
    })

    it('is empty under a blocker, an unsupported API, or a null status', () => {
        expect(updatableMcus(status({ blocker: { reason: 'printing', message: 'printing' } }))).toEqual([])
        expect(updatableMcus(status({ api_version: 2 }))).toEqual([])
        expect(updatableMcus(null)).toEqual([])
    })

    it('ignores unknown states even when they carry the update action', () => {
        expect(updatableMcus(status({ mcus: [mcu({ state: 'future_state' })] }))).toEqual([])
    })
})

describe('type guards', () => {
    it('accepts well-formed payloads', () => {
        expect(isStatusResponse(status({ run: running() }))).toBe(true)
        expect(isUpdateResponse(event({ complete: true, result: failed }))).toBe(true)
        expect(isUpdateResult({ run_id: 'R' })).toBe(true)
    })

    it('rejects malformed payloads', () => {
        expect(isStatusResponse({ api_version: 1, host: {}, mcus: [{ name: 'x' }] })).toBe(false)
        expect(isStatusResponse(null)).toBe(false)
        expect(isUpdateResponse({ run_id: 'R' })).toBe(false)
        expect(isUpdateResult({})).toBe(false)
        expect(isUpdateResult(undefined)).toBe(false)
    })

    it('reads the api version of any object and builds an unsupported status', () => {
        expect(apiVersionOf({ api_version: 2 })).toBe(2)
        expect(apiVersionOf('nope')).toBeNull()
        const unsupported = unsupportedStatus(2)
        expect(unsupported.api_version).toBe(2)
        expect(unsupported.mcus).toEqual([])
        expect(updatableMcus(unsupported)).toEqual([])
    })
})

describe('agent errors', () => {
    const wrapped = {
        code: 424,
        message: 'Agent aldis RPC error',
        data: { code: -32000, message: 'update already running', data: { reason: 'busy' } },
    }

    it('unwraps the agent message and reason from a relayed error', () => {
        expect(agentErrorMessage(wrapped, 'fallback')).toBe('update already running')
        expect(agentErrorReason(wrapped)).toBe('busy')
    })

    it('falls back to a plain error message', () => {
        expect(agentErrorMessage({ code: 500, message: 'Agent not connected' }, 'fallback')).toBe('Agent not connected')
        expect(agentErrorMessage(new Error('boom'), 'fallback')).toBe('boom')
        expect(agentErrorReason({ message: 'x' })).toBeNull()
    })

    it('uses the fallback for a rejection without an error object', () => {
        expect(agentErrorMessage(undefined, 'fallback')).toBe('fallback')
    })
})

describe('run walkthrough', () => {
    it('keeps the log intact across snapshots and closes cleanly', () => {
        let state: FirmwareRunState = { ...emptyRun(), busy: true }

        state = applyEvent(state, event({ message: 'stopping' }))
        expect(state.runId).toBe('R')

        state = reconcileRun(state, running([event({ message: 'stopping' })]))
        state = applyEvent(state, event({ message: 'flashing' }))
        state = applyEvent(state, event({ complete: true, message: 'done', result: failed }))
        expect(state.busy).toBe(false)
        expect(state.responses).toHaveLength(3)

        state = reconcileRun(state, running())
        expect(needsRetry(state, running())).toBe(true)
        expect(state.responses).toHaveLength(3)

        state = { ...state, responses: [] }
        state = reconcileRun(state, { ...running(), state: 'finished', result: failed })
        expect(state.responses).toEqual([])
        expect(state.busy).toBe(false)
    })

    it('rehydrates after a reload mid-run', () => {
        let state = reconcileRun(emptyRun(), running([event({ message: 'a' })]))
        state = applyEvent(state, event({ message: 'b' }))
        expect(state.busy).toBe(true)
        expect(state.responses.map((line) => line.message)).toEqual(['can: a', 'can: b'])
    })
})

describe('firmwareDialogVisible', () => {
    it('shows while busy or while a log is left to read', () => {
        expect(firmwareDialogVisible(true, 0)).toBe(true)
        expect(firmwareDialogVisible(false, 3)).toBe(true)
    })

    it('hides once a rejected request leaves no run and no log', () => {
        expect(firmwareDialogVisible(false, 0)).toBe(false)
    })
})
