export interface GuiPresetsState {
    presets: Record<string, GuiPresetsStatePreset>
    cooldownGcode: string
}

export interface GuiPresetsStatePreset {
    id?: string | null
    name: string
    gcode: string
    values: Record<string, GuiPresetsStatePresetHeaterSetting>
}

interface GuiPresetsStatePresetHeaterSetting {
    bool: boolean
    type: 'heater' | 'temperature_fan'
    value: number
}

export interface TemperaturePanelHeaterPreset {
    value: number
    text: string
}
