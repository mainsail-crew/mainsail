export interface GuiPresetsState {
    presets: {
        [key: string]: GuiPresetsStatePreset
    }
    cooldownGcode: string
}

export interface GuiPresetsStatePreset {
    id?: string | null
    name: string
    gcode: string
    values: {
        [key: string]: {
            bool: boolean
            type: 'heater' | 'temperature_fan'
            value: number
        }
    }
}
