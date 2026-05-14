import { GetterTree } from 'vuex'
import {
    GuiState,
    GuiStateDashboard,
    GuiStateLayoutoption,
    GuiTempchartDatasetSetting,
    GuiViewport,
} from '@/store/gui/types'
import { GuiMacrosStateMacrogroup } from '@/store/gui/macros/types'
import { allDashboardPanels, defaultTheme, themes } from '@/store/variables'
import { RootState, Theme } from '@/store/types'

export const getters: GetterTree<GuiState, RootState> = {
    getThemeName(state): string {
        const theme = state.uiSettings.theme as string

        // return defaultTheme, if theme doesnt exists
        if (themes.findIndex((tmp: Theme) => tmp.name === theme) === -1) return defaultTheme

        return theme
    },

    getDatasetValue:
        (state) =>
        <K extends keyof GuiTempchartDatasetSetting>(payload: {
            name: string
            type: K
        }): GuiTempchartDatasetSetting[K] | boolean => {
            const entry = state.view.tempchart.datasetSettings[payload.name]

            if (entry && payload.type in entry) return entry[payload.type]

            return ['temperature', 'target'].includes(payload.type)
        },

    getChartDataAdditionalSensorValue:
        (state) =>
        (payload: { name: string; sensor: string }): boolean => {
            const entry = state.view.tempchart.datasetSettings[payload.name] ?? null
            if (entry === null || typeof entry !== 'object' || !('additionalSensors' in entry)) return true

            const sensors = entry.additionalSensors as Record<string, unknown>
            return (sensors[payload.sensor] ?? true) as boolean
        },

    getPanelExpand:
        (state) =>
        (name: string, viewport: GuiViewport): boolean => {
            if ('dashboard' in state && viewport in state.dashboard.nonExpandPanels) {
                return !state.dashboard.nonExpandPanels[viewport].includes(name)
            }

            return true
        },

    getAllPossiblePanels: (state, getters, rootState, rootGetters): string[] => {
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

        // remove spoolman panel, if no spoolman component exists in moonraker
        if (!rootState.server?.components.includes('spoolman')) {
            allPanels = allPanels.filter((name) => name !== 'spoolman')
        }

        // remove afc panel, if no AFC module exists in Klipper
        if (!rootState.printer?.AFC) {
            allPanels = allPanels.filter((name) => name !== 'afc')
        }

        // remove mmu panel, if no Happy Hare exists in Klipper
        if (!rootState.printer?.mmu) {
            allPanels = allPanels.filter((name) => name !== 'mmu')
        }

        // remove led_effects panel, if no led_effect object exists in Klipper
        const ledEffectsPrefix = 'led_effect '
        const existsLedEffects = Object.keys(rootState.printer ?? {}).some((name) =>
            name.toLowerCase().startsWith(ledEffectsPrefix)
        )
        if (!existsLedEffects) {
            allPanels = allPanels.filter((name) => name !== 'led-effects')
        }

        return allPanels
    },

    getPanels:
        (state, getters, rootState) =>
        (viewport: string, column: number, onlyVisible: boolean = false): GuiStateLayoutoption[] => {
            const layoutName = (column ? `${viewport}Layout${column}` : `${viewport}Layout`) as keyof GuiStateDashboard
            let panels = state.dashboard[layoutName] as GuiStateLayoutoption[]

            panels = panels?.filter((element) => element !== null) ?? []
            const allPossiblePanels = getters['getAllPossiblePanels'] as string[]

            if (column < 2) {
                const allViewportPanels = getters['getAllPanelsFromViewport'](viewport) as GuiStateLayoutoption[]
                const missingPanels: GuiStateLayoutoption[] = []

                allPossiblePanels.forEach((panelname: string) => {
                    if (!allViewportPanels.find((panel) => panel.name === panelname))
                        missingPanels.push({
                            name: panelname,
                            visible: true,
                        })
                })
                panels = panels.concat(missingPanels)
            }

            if (onlyVisible) {
                panels = panels.filter((element) => element.visible)
            }

            if (rootState.gui?.macros?.mode === 'simple')
                panels = panels.filter((element) => !element.name.startsWith('macrogroup_'))
            else {
                panels = panels.filter((element) => element.name !== 'macros')
                const macrogroups = getters['macros/getAllMacrogroups']
                if (macrogroups.length) {
                    panels = panels.filter((element) => {
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

            return panels.filter((element) => allPossiblePanels.includes(element.name))
        },

    getAllPanelsFromViewport:
        (state) =>
        (viewport: string): GuiStateLayoutoption[] => {
            let panels: GuiStateLayoutoption[] = []

            const layoutKey = `${viewport}Layout` as keyof GuiStateDashboard
            if (layoutKey in state.dashboard) {
                panels = panels.concat(state.dashboard[layoutKey] as GuiStateLayoutoption[])
            }

            let nr = 1
            while (`${viewport}Layout${nr}` in state.dashboard) {
                const layoutKeyNr = `${viewport}Layout${nr}` as keyof GuiStateDashboard
                panels = panels.concat(state.dashboard[layoutKeyNr] as GuiStateLayoutoption[])
                nr++
            }

            return panels
        },

    getHours12Format: (state): boolean => {
        const setting = state.general.timeFormat
        if (setting === '12hours') return true
        if (setting === null) {
            return Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hour12 as boolean
        }

        return false
    },
}
