import { GetterTree } from 'vuex'
import { GuiPresetsState, GuiPresetsStatePreset, TemperaturePanelHeaterPreset } from '@/store/gui/presets/types'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { RootState } from '@/store/types'

export const getters: GetterTree<GuiPresetsState, RootState> = {
    getCooldownGcode: (state): string => {
        return state.cooldownGcode ?? 'TURN_OFF_HEATERS'
    },

    getPresets: (state): GuiPresetsStatePreset[] => {
        const presets: GuiPresetsStatePreset[] = Object.entries(state.presets).map(([id, preset]) => ({
            ...preset,
            id,
        }))

        return caseInsensitiveSort(presets, 'name')
    },

    getPresetsFromHeater:
        (state) =>
        (payload: { name: string }): TemperaturePanelHeaterPreset[] => {
            const output: TemperaturePanelHeaterPreset[] = [{ value: 0, text: '0 °C' }]

            // return only 0 entry, if there is no presets set
            if (!('presets' in state)) return output

            Object.values(state.presets).forEach((preset: GuiPresetsStatePreset) => {
                const presetStatus = preset.values[payload.name]?.bool ?? false
                if (!presetStatus) return

                const presetValue = parseFloat(preset.values[payload.name]?.value?.toString() ?? '0')
                if (output.some((entry) => entry.value === presetValue)) return

                output.push({
                    value: Number(preset.values[payload.name].value),
                    text: preset.values[payload.name].value + ' °C',
                })
            })

            return output.sort((a, b) => b.value - a.value)
        },
}
