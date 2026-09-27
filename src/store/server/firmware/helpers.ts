import type {
    AldisAgentError,
    AldisRun,
    AldisRunResult,
    AldisStatusResponse,
    AldisUpdateResponse,
    AldisUpdateResult,
    FirmwareResponseLine,
    FirmwareRunState,
} from './types'

export const AGENT_NAME = 'aldis'
export const SUPPORTED_API_VERSION = 1

const KNOWN_UPDATABLE_STATES: readonly string[] = ['update_available']

const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object'

export const formatResponse = (payload: AldisUpdateResponse, id: number): FirmwareResponseLine => ({
    id,
    date: new Date(),
    message: payload.mcu ? `${payload.mcu}: ${payload.message}` : payload.message,
    mcu: payload.mcu,
    phase: payload.phase,
})

const shouldAdoptRun = (state: FirmwareRunState, payload: AldisUpdateResponse): boolean =>
    state.runId === null || (payload.run_id !== state.runId && !state.busy)

export const applyEvent = (state: FirmwareRunState, payload: AldisUpdateResponse): FirmwareRunState => {
    const next: FirmwareRunState = shouldAdoptRun(state, payload)
        ? {
              ...state,
              runId: payload.run_id,
              busy: true,
              responses: [formatResponse(payload, 0)],
              lastResult: null,
              lastMessage: null,
          }
        : { ...state, responses: [...state.responses, formatResponse(payload, state.responses.length)] }

    return payload.complete
        ? { ...next, busy: false, lastResult: payload.result ?? null, lastMessage: payload.message }
        : next
}

export const reconcileRun = (state: FirmwareRunState, run: AldisRun | null): FirmwareRunState => {
    if (state.runId !== null || run === null) return state

    if (run.state === 'running') {
        return {
            ...state,
            busy: true,
            runId: run.run_id,
            responses: run.messages.map((message, id) => formatResponse(message, id)),
        }
    }

    if (state.lastResult === null) {
        return {
            ...state,
            lastResult: run.result ?? null,
            lastMessage: run.messages[run.messages.length - 1]?.message ?? null,
        }
    }

    return state
}

// The agent emits a run's final event before it marks the run finished, so a
// refresh issued on that event can read pre-run MCU rows once.
export const needsRetry = (state: FirmwareRunState, run: AldisRun | null): boolean =>
    state.runId !== null && !state.busy && run?.state === 'running' && run.run_id === state.runId

export const updatableMcus = (status: AldisStatusResponse | null): string[] => {
    if (status === null || status.blocker !== null || status.api_version !== SUPPORTED_API_VERSION) return []

    return status.mcus
        .filter((mcu) => KNOWN_UPDATABLE_STATES.includes(mcu.state) && mcu.actions.includes('update'))
        .map((mcu) => mcu.name)
}

const isRunResult = (value: unknown): value is AldisRunResult =>
    isObject(value) &&
    (value.outcome === 'success' || value.outcome === 'failed') &&
    typeof value.klippy_state === 'string' &&
    typeof value.klipper_left_stopped === 'boolean' &&
    Array.isArray(value.mcus)

export const isUpdateResponse = (value: unknown): value is AldisUpdateResponse =>
    isObject(value) &&
    typeof value.run_id === 'string' &&
    typeof value.message === 'string' &&
    typeof value.complete === 'boolean' &&
    typeof value.phase === 'string' &&
    (value.mcu === null || typeof value.mcu === 'string') &&
    (value.result === undefined || value.result === null || isRunResult(value.result))

const isRun = (value: unknown): value is AldisRun =>
    isObject(value) &&
    typeof value.run_id === 'string' &&
    (value.state === 'running' || value.state === 'finished') &&
    Array.isArray(value.messages) &&
    value.messages.every(isUpdateResponse) &&
    (value.result === undefined || value.result === null || isRunResult(value.result))

const isMcu = (value: unknown): boolean =>
    isObject(value) &&
    typeof value.name === 'string' &&
    typeof value.state === 'string' &&
    typeof value.message === 'string' &&
    Array.isArray(value.actions) &&
    (value.running_version === null || typeof value.running_version === 'string')

export const isStatusResponse = (value: unknown): value is AldisStatusResponse =>
    isObject(value) &&
    typeof value.api_version === 'number' &&
    isObject(value.host) &&
    Array.isArray(value.mcus) &&
    value.mcus.every(isMcu) &&
    (value.run === undefined || value.run === null || isRun(value.run))

export const isUpdateResult = (value: unknown): value is AldisUpdateResult =>
    isObject(value) && typeof value.run_id === 'string'

export const apiVersionOf = (value: unknown): number | null =>
    isObject(value) && typeof value.api_version === 'number' ? value.api_version : null

export const unsupportedStatus = (apiVersion: number): AldisStatusResponse => ({
    api_version: apiVersion,
    host: { klippy_state: 'disconnected', klippy_message: '' },
    blocker: null,
    mcus: [],
    run: null,
})

const nestedAgentError = (error: unknown): AldisAgentError | null =>
    isObject(error) && isObject(error.data) && typeof error.data.message === 'string'
        ? (error.data as unknown as AldisAgentError)
        : null

export const agentErrorMessage = (error: unknown, fallback: string): string => {
    const nested = nestedAgentError(error)
    if (nested) return nested.message
    if (isObject(error) && typeof error.message === 'string') return error.message

    return fallback
}

export const agentErrorReason = (error: unknown): string | null => {
    const reason = nestedAgentError(error)?.data?.reason

    return typeof reason === 'string' ? reason : null
}

export const firmwareDialogVisible = (busy: boolean, responseCount: number): boolean => busy || responseCount > 0
