import Vue from 'vue'
import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import {GuiState, GuiStateMacrogroup, GuiStateMacrogroupMacros} from '@/store/gui/types'
import { v4 as uuid } from 'uuid'

export const mutations: MutationTree<GuiState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setData(state, payload) {
        // eslint-disable-next-line
		const setDataDeep = (currentState: any, payload: any) => {
            if (typeof payload === 'object') {
                Object.keys(payload).forEach((key: string) => {
                    const value = payload[key]

                    if (typeof value === 'object' && !Array.isArray(value) && key in currentState) {
                        setDataDeep(currentState[key], value)
                    } else Vue.set(currentState, key, value)
                })
            }
        }

        setDataDeep(state, payload)
    },

    saveSetting(state, payload) {
        // eslint-disable-next-line
        const deepSet = (obj:any, is:string[] | string, value:any):any => {
            if (is !== undefined && typeof is === 'string')
                return deepSet(obj,is.split('.'), value)
            else if (is.length==1 && value !== undefined)
                return obj[is[0]] = value
            else if (is.length==0)
                return obj
            else
            if (!(is[0] in obj)) obj[is[0]] = {}
            return deepSet(obj[is[0]],is.slice(1), value)
        }

        deepSet(state, payload.name, payload.value)
    },

    setHeaterChartVisibility(state, payload) {
        const index = state.dashboard.hiddenTempChart.indexOf(payload.name.toUpperCase())

        if (payload.hidden && index === -1) state.dashboard.hiddenTempChart.push(payload.name.toUpperCase())
        else if (payload.hidden !== true && index > -1) state.dashboard.hiddenTempChart.splice(index, 1)
    },

    setGcodefilesMetadata(state, data) {
        if (data.value && state.gcodefiles.hideMetadataColums.includes(data.name)) {
            state.gcodefiles.hideMetadataColums.splice(state.gcodefiles.hideMetadataColums.indexOf(data.name), 1)
        } else if (!data.value && !state.gcodefiles.hideMetadataColums.includes(data.name)) {
            state.gcodefiles.hideMetadataColums.push(data.name)
        }
    },

    setGcodefilesShowHiddenFiles(state, value) {
        Vue.set(state.gcodefiles, 'showHiddenFiles', value)
    },

    setCurrentWebcam(state, payload) {
        Vue.set(state.webcamSettings.currentCam, payload.viewport, payload.value)
    },

    addPreset(state, payload) {
        state.presets.push({
            name: payload.name,
            gcode: payload.gcode,
            values: payload.values
        })
    },

    updatePreset(state, payload) {
        if (state.presets[payload.index]) {
            Vue.set(state.presets[payload.index], 'name', payload.name)
            Vue.set(state.presets[payload.index], 'gcode', payload.gcode)
            Vue.set(state.presets[payload.index], 'values', payload.values)
        }
    },

    deletePreset(state, payload) {
        if (state.presets[payload.index]) {
            state.presets.splice(payload.index, 1)
        }
    },

    addConsoleFilter(state, payload) {
        state.console.customFilters.push({
            name: payload.name,
            regex: payload.regex,
            bool: payload.bool
        })
    },

    updateConsoleFilter(state, payload) {
        if (state.console.customFilters[payload.index]) {
            Vue.set(state.console.customFilters[payload.index], 'name', payload.name)
            Vue.set(state.console.customFilters[payload.index], 'regex', payload.regex)
            Vue.set(state.console.customFilters[payload.index], 'bool', payload.bool)
        }
    },

    deleteConsoleFilter(state, payload) {
        if (state.console.customFilters[payload.index]) {
            state.console.customFilters.splice(payload.index, 1)
        }
    },

    setHistoryColumns(state, data) {
        if (data.value && state.history.hideColums.includes(data.name)) {
            state.history.hideColums.splice(state.history.hideColums.indexOf(data.name), 1)
        } else if (!data.value && !state.history.hideColums.includes(data.name)) {
            state.history.hideColums.push(data.name)
        }
    },

    setHistoryHidePrintStatus(state, payload) {
        Vue.set(state.history, 'hidePrintStatus', payload)
    },

    addClosePanel(state, payload) {
        const nonExpandPanels = [...state.dashboard.nonExpandPanels]

        if (!nonExpandPanels.includes(payload.name)) {
            nonExpandPanels.push(payload.name)

            Vue.set(state.dashboard, 'nonExpandPanels', nonExpandPanels)
        }
    },

    removeClosePanel(state, payload) {
        const nonExpandPanels = [...state.dashboard.nonExpandPanels]
        const index = nonExpandPanels.indexOf(payload.name)
        if (index > -1) {
            nonExpandPanels.splice(index, 1)

            Vue.set(state.dashboard, 'nonExpandPanels', nonExpandPanels)
        }
    },

    storeMacrogroup(state, payload) {
        state.dashboard.macrogroups.push(payload)
    },

    destroyMacrogroup(state, payload) {
        const index = state.dashboard.macrogroups.findIndex((group: GuiStateMacrogroup) => group.id === payload)
        if (index !== -1) state.dashboard.macrogroups.splice(index, 1)
    },

    addMacroToMacrogroup(state, payload) {
        const index = state.dashboard.macrogroups.findIndex((group: GuiStateMacrogroup) => group.id === payload.group)
        if (index !== -1) {
            const macros = [...state.dashboard.macrogroups[index]?.macros ?? []]

            const newMacro: GuiStateMacrogroupMacros = {
                pos: 1,
                name: payload.macro,
                color: 'group',
                showInStandby: true,
                showInPrinting: true,
                showInPause: true
            }

            if (macros.length) newMacro.pos = Math.max(...macros.map((m: GuiStateMacrogroupMacros) => m.pos)) + 1
            macros.push(newMacro)

            Vue.set(state.dashboard.macrogroups[index], 'macros', macros)
        }
    },

    updateMacroFromMacrogroup(state, payload) {
        const index = state.dashboard.macrogroups.findIndex((group: GuiStateMacrogroup) => group.id === payload.group)
        if (index !== -1) {
            const macros = [...state.dashboard.macrogroups[index]?.macros ?? []]
            const updateMacroIndex = macros.findIndex((m: GuiStateMacrogroupMacros) => m.name === payload.macro)
            if (updateMacroIndex !== -1) {
                macros[updateMacroIndex][payload.option] = payload.value
                Vue.set(state.dashboard.macrogroups[index], 'macros', macros)
            }
        }
    },

    removeMacroFromMacrogroup(state, payload) {
        const index = state.dashboard.macrogroups.findIndex((group: GuiStateMacrogroup) => group.id === payload.group)
        if (index !== -1) {
            const macros = [...state.dashboard.macrogroups[index]?.macros ?? []]
            const deletedMacroIndex = macros.findIndex((m: GuiStateMacrogroupMacros) => m.name === payload.macro)
            if (deletedMacroIndex !== -1) {
                const oldPos = macros[deletedMacroIndex].pos
                macros.splice(deletedMacroIndex, 1)

                macros.filter((macro: GuiStateMacrogroupMacros) => macro.pos > oldPos).forEach((macro: GuiStateMacrogroupMacros) => {
                    macro.pos = macro.pos - 1
                })
            }

            Vue.set(state.dashboard.macrogroups[index], 'macros', macros)
        }
    },

    updateMacrogroup(state, payload) {
        const index = state.dashboard.macrogroups.findIndex((group: GuiStateMacrogroup) => group.id === payload.group)
        if (index !== -1 && payload.option in state.dashboard.macrogroups[index]) {
            Vue.set(state.dashboard.macrogroups[index], payload.option, payload.value)
        }
    },

    deleteFromDashboardLayout(state, payload) {
        const layoutArray = [...state.dashboard[payload.layoutname]]
        layoutArray.splice(payload.index, 1)
        Vue.set(state.dashboard, payload.layoutname, layoutArray)
    },

    addToLockedSliders(state, payload){
        const lockedSliders = [...state.dashboard.lockedSliders]
        if (!lockedSliders.includes(payload.name)) {
            lockedSliders.push(payload.name)

            Vue.set(state.dashboard, 'lockedSliders', lockedSliders)
        }
    },

    removeFromLockedSliders(state, payload){
        const lockedSliders = [...state.dashboard.lockedSliders]
        const index = lockedSliders.indexOf(payload.name)
        if (index > -1) {
            lockedSliders.splice(index, 1)

            Vue.set(state.dashboard, 'lockedSliders', lockedSliders)
        }
    }
}
