export interface MmuGateDetails {
    index: number
    status: number
    filamentName: string
    material: string
    color: string
    temperature: number
    spoolId: number | null
    speedOverride: number
    endlessSpoolGroup: number | null
}

export interface SlicerToolDetails {
    color: string
    material: string
    temp: number
    name: string
    inUse: boolean
}

export interface MmuUnitDetails {
    name: string
    vendor: string
    version: string
    numGates: number
    firstGate: number
    selectorType: string
    variableRotationDistances: boolean
    variableBowdenLengths: boolean
    requireBowdenMove: boolean
    filamentAlwaysGripped: boolean
    hasBypass: boolean
    multiGear: boolean
    temperature: number | null
    humidity: number | null
}
