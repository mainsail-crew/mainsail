export interface CncSpindleStatePayload {
    state: 'off' | 'cw' | 'ccw'
    rpm?: number
    override?: number
}

export interface CncCoolantStatePayload {
    flood?: boolean
    mist?: boolean
}

export interface CncWcsSelectPayload {
    wcs: string
    offsets?: Record<string, number>
}

export interface CncSetZeroPayload {
    axes?: string[]
}

export interface CncJogPayload {
    axis: 'X' | 'Y' | 'Z'
    distance: number
    feedrate: number
}

async function requestCnc<T>(apiUrl: string, path: string, body?: unknown): Promise<T | null> {
    const response = await fetch(`${apiUrl}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (!response.ok) {
        throw new Error(`CNC request failed for ${path}: ${response.status}`)
    }

    if (response.status === 204) {
        return null
    }

    return (await response.json()) as T
}

export function getCncState(apiUrl: string) {
    return fetch(`${apiUrl}/server/cnc/state`).then((response) => response.json())
}

export function getCncSpindle(apiUrl: string) {
    return fetch(`${apiUrl}/server/cnc/spindle`).then((response) => response.json())
}

export function setCncSpindle(apiUrl: string, payload: CncSpindleStatePayload) {
    return requestCnc(apiUrl, '/server/cnc/spindle', payload)
}

export function getCncCoolant(apiUrl: string) {
    return fetch(`${apiUrl}/server/cnc/coolant`).then((response) => response.json())
}

export function setCncCoolant(apiUrl: string, payload: CncCoolantStatePayload) {
    return requestCnc(apiUrl, '/server/cnc/coolant', payload)
}

export function getCncUnits(apiUrl: string) {
    return fetch(`${apiUrl}/server/cnc/units`).then((response) => response.json())
}

export function setCncUnits(apiUrl: string, units: string) {
    return requestCnc(apiUrl, '/server/cnc/units', { units })
}

export function getCncWcs(apiUrl: string) {
    return fetch(`${apiUrl}/server/cnc/wcs`).then((response) => response.json())
}

export function selectCncWcs(apiUrl: string, payload: CncWcsSelectPayload) {
    return requestCnc(apiUrl, '/server/cnc/wcs/select', payload)
}

export function setCncZero(apiUrl: string, payload: CncSetZeroPayload = {}) {
    return requestCnc(apiUrl, '/server/cnc/wcs/set-zero', payload)
}

export function jogCnc(apiUrl: string, payload: CncJogPayload) {
    return requestCnc(apiUrl, '/server/cnc/jog', payload)
}

export function getCncSettings(apiUrl: string) {
    return fetch(`${apiUrl}/server/cnc/settings`).then((response) => response.json())
}

export function updateCncSettings(apiUrl: string, settings: Record<string, unknown>) {
    return requestCnc(apiUrl, '/server/cnc/settings', settings)
}
