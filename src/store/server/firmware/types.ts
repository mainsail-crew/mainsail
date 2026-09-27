export type AldisKlippyState = 'ready' | 'startup' | 'error' | 'shutdown' | 'disconnected'

export interface AldisHost {
    klippy_state: AldisKlippyState
    klippy_message: string
    software_version?: string
    klipper_path?: string
    checkout_version?: string
}

export type AldisBlockerReason =
    | 'non_local_moonraker'
    | 'unsupported_instance'
    | 'config_error'
    | 'klippy_unavailable'
    | 'restart_pending'
    | 'printing'

export interface AldisBlocker {
    reason: AldisBlockerReason | string
    message: string
}

export type AldisTransport = { type: 'serial'; device: string } | { type: 'can'; interface: string; uuid: string }

export type AldisMcuState =
    | 'current'
    | 'update_available'
    | 'indeterminate'
    | 'externally_managed'
    | 'unsupported_legacy'
    | 'unsupported_mcu'
    | 'not_identified'
    | 'not_responding'

export interface AldisMcu {
    name: string
    transport: AldisTransport | null
    running_version: string | null
    state: AldisMcuState | string
    message: string
    actions: string[]
}

export interface AldisMcuResult {
    name: string
    outcome: 'updated' | 'failed' | 'not_attempted'
    message: string
}

export interface AldisRunResult {
    outcome: 'success' | 'failed'
    klippy_state: AldisKlippyState
    klipper_left_stopped: boolean
    mcus: AldisMcuResult[]
}

export interface AldisUpdateResponse {
    run_id: string
    mcu: string | null
    phase: string
    message: string
    complete: boolean
    result?: AldisRunResult | null
}

export interface AldisRun {
    run_id: string
    state: 'running' | 'finished'
    messages: AldisUpdateResponse[]
    result: AldisRunResult | null
}

export interface AldisStatusResponse {
    api_version: number
    host: AldisHost
    blocker: AldisBlocker | null
    mcus: AldisMcu[]
    run: AldisRun | null
}

export type AldisUpdateArguments = { mcus: string[] } | { all: true }

export interface AldisUpdateResult {
    run_id: string
}

export interface AldisAgentError {
    code: number
    message: string
    data?: {
        reason?: string
        [key: string]: unknown
    }
}

export interface FirmwareResponseLine {
    id: number
    date: Date
    message: string
    mcu: string | null
    phase: string
}

export interface FirmwareRunState {
    busy: boolean
    runId: string | null
    responses: FirmwareResponseLine[]
    lastResult: AldisRunResult | null
    lastMessage: string | null
}

export interface ServerFirmwareState extends FirmwareRunState {
    initialised: boolean
    status: AldisStatusResponse | null
    statusError: string | null
    refreshing: boolean
    refreshQueued: boolean
    retried: boolean
}
