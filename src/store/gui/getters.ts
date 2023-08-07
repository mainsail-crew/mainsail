import { GetterTree } from 'vuex'
import { GuiState } from '@/store/gui/types'
import { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import { allDashboardPanels } from '@/store/variables'

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

    getAllPossiblePanels: (state, getters, rootState, rootGetters) => {
        let allPanels = [...allDashboardPanels]

        // remove macros panel and add macrogroups panels if macroMode === expert
        if (state.macros?.mode === 'expert') {
            const macrogroups = getters['macros/getAllMacrogroups']

            macrogroups.forEach((group: GuiMacrosStateMacrogroup) => {
                allPanels.push('macrogroup_' + group.id)
            })

            allPanels = allPanels.filter((name) => name !== 'macros')
        }

        // remove toolhead & machine-settings panel, if kinematics === none
        const printerKinematics = rootGetters['printer/getKinematics']
        if (printerKinematics === 'none') {
            allPanels = allPanels.filter((name) => !['toolhead-control', 'machine-settings'].includes(name))
        }

        // remove extruder panel, if printerExtruderCount < 1
        const printerExtruders = rootGetters['printer/getExtruders']
        if (printerExtruders.length < 1) {
            allPanels = allPanels.filter((name) => name !== 'extruder-control')
        }

        // remove temperature panel, if sensors < 1
        const printerTemperatureSensors = rootState.printer?.heaters?.available_sensors ?? []
        if (printerTemperatureSensors.length < 1) {
            allPanels = allPanels.filter((name) => name !== 'temperature')
        }

        // remove webcam panel, if no webcam exists
        const webcams = getters['webcams/getWebcams']
        if (webcams.length === 0) {
            allPanels = allPanels.filter((name) => name !== 'webcam')
        }

        return allPanels
    },

    getPanels:
        (state, getters, rootState) =>
        (viewport: string, column: number, onlyVisible: boolean = false) => {
            const layoutName = column ? `${viewport}Layout${column}` : `${viewport}Layout`
            // @ts-ignore
            let panels = state.dashboard[layoutName]?.filter((element: any) => element !== null) ?? []
            const allPossiblePanels = getters['getAllPossiblePanels']

            if (column < 2) {
                const allViewportPanels = getters['getAllPanelsFromViewport'](viewport)
                const missingPanels: any[] = []

                allPossiblePanels.forEach((panelname: string) => {
                    if (!allViewportPanels.find((panel: any) => panel.name === panelname))
                        missingPanels.push({
                            name: panelname,
                            visible: true,
                        })
                })
                panels = panels.concat(missingPanels)
            }

            if (onlyVisible) {
                panels = panels.filter((element: any) => element.visible)
            }

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

            return panels.filter((element: any) => allPossiblePanels.includes(element.name))
        },

    getAllPanelsFromViewport: (state) => (viewport: string) => {
        let panels: any = []

        if (`${viewport}Layout` in state.dashboard) {
            // @ts-ignore
            panels = panels.concat(state.dashboard[`${viewport}Layout`])
        }

        let nr = 1
        while (`${viewport}Layout${nr}` in state.dashboard) {
            // @ts-ignore
            panels = panels.concat(state.dashboard[`${viewport}Layout${nr}`])
            nr++
        }

        return panels
    },

    getDefaultControlActionButton: (state, getters, rootState, rootGetters) => {
        if (rootGetters['printer/existsQGL']) return 'qgl'
        else if (rootGetters['printer/existsZtilt']) return 'ztilt'

        return 'm84'
    },

    getHours12Format: (state) => {
        const setting = state.general.timeFormat
        if (setting === '12hours') return true
        if (setting === null) {
            const browserLocale =
                navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language

            if (browserLocale === 'en_us') return true
        }

        return false
    },
}
