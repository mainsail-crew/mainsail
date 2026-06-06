export type CncMachineState = 'idle' | 'homing' | 'running' | 'paused' | 'alarm' | 'disconnected'

export type CncWcs = 'G53' | 'G54' | 'G55' | 'G56' | 'G57' | 'G58' | 'G59'

export interface CncAxisPosition {
    x: number
    y: number
    z: number
}

export interface CncStatus {
    machineState: CncMachineState
    activeFile: string | null
    wcs: CncWcs
    distanceMode: 'G90' | 'G91'
    units: 'G20' | 'G21'
    spindleOn: boolean
    spindleDirection: 'cw' | 'ccw' | 'off'
    coolantA: boolean
    coolantB: boolean
    feedOverride: number
    spindleOverride: number
    machine: CncAxisPosition
    work: CncAxisPosition
    homed: {
        x: boolean
        y: boolean
        z: boolean
    }
}
