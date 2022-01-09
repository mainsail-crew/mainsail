import { GetterTree } from 'vuex'
import {GuiPresetsState, GuiPresetsStatePreset} from '@/store/gui/presets/types'
import {caseInsensitiveSort} from '@/plugins/helpers'

// eslint-disable-next-line
export const getters: GetterTree<GuiPresetsState, any> = {
    getCooldownGcode: (state) => {
        return state.cooldownGcode ?? 'TURN_OFF_HEATERS'
    },

    getPresets:(state) => {
        const presets: GuiPresetsStatePreset[] = []

        if ('presets' in state) {
            Object.keys(state.presets).forEach((id: string) => {
                presets.push({...state.presets[id], id})
            })
        }

        return caseInsensitiveSort(presets, 'name')
    },

    getPresetsFromHeater: state => (payload: { name: string }) => {
        interface preset {
            value: number
            text: string
        }

        const output: preset[] = []

        output.push({
            value: 0,
            text: '0 °C'
        })

        if ('presets' in state) {
            Object.keys(state.presets).forEach((id: string) => {
                const preset = state.presets[id]

                if (
                    payload.name in preset.values &&
                    preset.values[payload.name].bool &&
                    output.findIndex((entry: preset) => entry.value === preset.values[payload.name].value) === -1
                ) {
                    output.push({
                        value: preset.values[payload.name].value,
                        text: preset.values[payload.name].value + ' °C'
                    })
                }
            })
        }

        return output.sort((a: preset,b: preset) => {
            if (a.value > b.value) return -1
            if (a.value < b.value) return 1

            return 0
        })
    },
}