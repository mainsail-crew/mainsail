export interface ServerPowerState {
    devices: ServerPowerStateDevice[]
}

export interface ServerPowerStateDevice {
    device: string
    status: 'off' | 'on' | 'error'
    locked_while_printing: boolean
    type: string
}
