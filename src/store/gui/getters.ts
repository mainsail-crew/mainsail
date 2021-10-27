import {caseInsensitiveSort} from '@/plugins/helpers'
import {GetterTree} from 'vuex'
import {GuiState, GuiStateConsoleFilter, GuiStateMacrogroup, GuiStatePreset} from '@/store/gui/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiState, any> = {

    getPreheatPresets:(state) => {
        const output = []

        for (const [key, preset] of Object.entries(state.presets)) {
            output.push(Object.assign({}, preset, { index: parseInt(key) }))
        }

        return caseInsensitiveSort(output, 'name')
    },

    getConsoleFilters:(state) => {
        const output = []

        for (const [key, filter] of Object.entries(state.console.customFilters)) {
            output.push(Object.assign({}, filter, { index: key }))
        }

        return caseInsensitiveSort(output, 'name')
    },

    getConsoleFilterRules:(state) => {
        const output = []

        if (state.console.hideWaitTemperatures)
            output.push('^(?:ok\\s+)?(B|C|T\\d*):')

        if (Array.isArray(state.console.customFilters) && state.console.customFilters.length) {
            state.console.customFilters.filter((filter: GuiStateConsoleFilter) => filter.bool === true).forEach((filter: GuiStateConsoleFilter) => {
                filter.regex.split('\n').forEach((rule: string) => {
                    if (rule !== '') output.push(rule)
                })
            })
        }

        return output
    },

    getWebcams:(state) => {
        const output = []

        for (const [key, webcam] of Object.entries(state.webcam.configs)) {
            output.push(Object.assign({}, webcam, { index: key }))
        }

        return caseInsensitiveSort(output, 'name')
    },

    getDatasetValue: (state) => (payload: { name: string, type: string }) => {
        if (
            payload.name in state.tempchart.datasetSettings &&
			payload.type in state.tempchart.datasetSettings[payload.name]
        ) return state.tempchart.datasetSettings[payload.name][payload.type]

        if (['temperature', 'target'].includes(payload.type)) return true

        return false
    },

    getDatasetAdditionalSensorValue: (state) => (payload: { name: string, sensor: string }) => {
        if (
            payload.name in state.tempchart.datasetSettings &&
			'additionalSensors' in state.tempchart.datasetSettings[payload.name] &&
			payload.sensor in state.tempchart.datasetSettings[payload.name].additionalSensors
        ) return state.tempchart.datasetSettings[payload.name].additionalSensors[payload.sensor]

        return true
    },

    getPresetsFromHeater: state => (payload: { name: string }) => {
        interface preset {
            value: number
        }

        const output: preset[] = []

        output.push({
            value: 0
        })

        Object.values(state.presets).forEach((preset: GuiStatePreset) => {
            if (
                payload.name in preset.values &&
                preset.values[payload.name].bool &&
                output.findIndex((entry: preset) => entry.value === preset.values[payload.name].value) === -1
            ) {
                output.push({
                    value: preset.values[payload.name].value,
                })
            }
        })

        return output.sort((a: preset,b: preset) => {
            if (a.value > b.value) return -1
            if (a.value < b.value) return 1

            return 0
        })
    },

    getPanelExpand: (state) => (name: string) => {
        return !state.dashboard.nonExpandPanels?.includes(name) ?? true
    },

    getAllMacroGroups: (state) => {
        return caseInsensitiveSort(state.dashboard.macrogroups ?? [], 'name')
    },

    getMacroGroup: (state) => (id: string) => {
        return state.dashboard.macrogroups.find((group: GuiStateMacrogroup) => group.id === id)
    },

    getPanels: (state, getters) => (viewport: string) => {
        let panels = state.dashboard[viewport]?.filter((element: any) => element !== null) ?? []

        if (state.dashboard.macroManagement === 'simple') panels = panels.filter((element: any) => !element.name.startsWith('macrogroup_'))
        else {
            panels = panels.filter((element: any) => element.name !== 'macros')
            const macrogroups = getters['getAllMacroGroups']
            if (macrogroups.length) {
                panels = panels.filter((element: any) => {
                    if (!element.name.startsWith('macrogroup_')) return true

                    const macrogroupId = element.name.substr(11)
                    return (macrogroups.findIndex((macrogroup: GuiStateMacrogroup) => macrogroup.id === macrogroupId) !== -1)
                })
            }
        }

        return panels
    }
}
