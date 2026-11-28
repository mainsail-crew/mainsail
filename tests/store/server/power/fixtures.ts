import type { PowerDevice, PowerDeviceState } from '@/types/moonraker/DevicesRPC'

export const powerDevice = (device: string, status: PowerDeviceState = 'off'): PowerDevice => ({
    device,
    status,
    locked_while_printing: false,
    type: 'gpio',
})
