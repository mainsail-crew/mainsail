import type { PowerDevice } from '@/types/moonraker/DevicesRPC'

export interface ServerPowerState {
    devices: PowerDevice[]
}
