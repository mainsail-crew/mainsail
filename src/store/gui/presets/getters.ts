import { GetterTree } from 'vuex'
import { GuiPresetsHeaterPreset, GuiPresetsState, GuiPresetsStatePreset } from '@/store/gui/presets/types'
import { caseInsensitiveSort } from '@/plugins/helpers'
import { RootState } from '@/store/types'

export const getters: GetterTree<GuiPresetsState, RootState> = {
    getCooldownGcode: (state) => {
        return state.cooldownGcode ?? 'TURN_OFF_HEATERS'
    },

    getPresets: (state) => {
        const presets: GuiPresetsStatePreset[] = []

        if ('presets' in state) {
            Object.keys(state.presets).forEach((id: string) => {
                presets.push({ ...state.presets[id], id })
            })
        }

        return caseInsensitiveSort(presets, 'name')
    },

    getPresetsFromHeater:
        (state) =>
        (payload: { name: string }): GuiPresetsHeaterPreset[] => {
            const output: GuiPresetsHeaterPreset[] = [{ value: 0, text: '0 °C' }]

            // return only 0 entry, if there is no presets set
            if (!('presets' in state)) return output

            Object.values(state.presets).forEach((preset) => {
                const heater = preset.values[payload.name]
                if (!heater?.bool) return

                const value = Number(heater.value ?? 0)
                if (isNaN(value)) return

                const existsAlready = output.some((entry) => entry.value === value)
                if (existsAlready) return

                output.push({ value, text: `${value} °C` })
            })

            return output.sort((a, b) => {
                if (a.value > b.value) return -1
                if (a.value < b.value) return 1

                return 0
            })
        },
}
