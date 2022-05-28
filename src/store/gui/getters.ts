import { GetterTree } from 'vuex'
import { GuiState } from '@/store/gui/types'
import { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import Vue from 'vue'

// eslint-disable-next-line
export const getters: GetterTree<GuiState, any> = {
    getDatasetValue: (state) => (payload: { name: string; type: string }) => {
        if (
            payload.name in state.view.tempchart.datasetSettings &&
            payload.type in state.view.tempchart.datasetSettings[payload.name]
        )
            return state.view.tempchart.datasetSettings[payload.name][payload.type]

        return ['temperature', 'target'].includes(payload.type)
    },

    getDatasetAdditionalSensorValue: (state) => (payload: { name: string; sensor: string }) => {
        if (
            payload.name in state.view.tempchart.datasetSettings &&
            'additionalSensors' in state.view.tempchart.datasetSettings[payload.name] &&
            payload.sensor in state.view.tempchart.datasetSettings[payload.name].additionalSensors
        )
            return state.view.tempchart.datasetSettings[payload.name].additionalSensors[payload.sensor]

        return true
    },

    getPanelExpand: (state) => (name: string, viewport: string) => {
        if ('dashboard' in state && viewport in state.dashboard.nonExpandPanels) {
            return !state.dashboard.nonExpandPanels[viewport].includes(name) ?? true
        }

        return true
    },

    getPanels: (state, getters, rootState) => (viewport: string) => {
        // @ts-ignore
        let panels = state.dashboard[viewport]?.filter((element: any) => element !== null) ?? []

        if (rootState.gui.macros.mode === 'simple')
            panels = panels.filter((element: any) => !element.name.startsWith('macrogroup_'))
        else {
            panels = panels.filter((element: any) => element.name !== 'macros')
            const macrogroups = getters['macros/getAllMacrogroups']
            if (macrogroups.length) {
                panels = panels.filter((element: any) => {
                    if (!element.name.startsWith('macrogroup_')) return true

                    const macrogroupId = element.name.slice(11)
                    return (
                        macrogroups.findIndex(
                            (macrogroup: GuiMacrosStateMacrogroup) => macrogroup.id === macrogroupId
                        ) !== -1
                    )
                })
            }
        }

        if (getters['webcams/getWebcams'].length === 0) {
            panels = panels.filter((element: any) => element.name !== 'webcam')
        }

        return panels
    },

    getDefaultControlActionButton: (state, getters, rootState, rootGetters) => {
        if (rootGetters['printer/existsQGL']) return 'qgl'
        else if (rootGetters['printer/existsZtilt']) return 'ztilt'

        return 'm84'
    },
}
