import Vue from 'vue'
import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import {GuiState, GuiStateMacrogroup} from '@/store/gui/types'

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

    addWebcam(state, payload) {
        const newWebcam = {
            name: payload.name,
            icon: payload.icon,
            service: payload.service,
            targetFps: payload.targetFps,
            url: payload.url,
            flipX: payload.flipX,
            flipY: payload.flipY,
        }

        state.webcam.configs.push(newWebcam)
    },

    updateWebcam(state, payload) {
        if (state.webcam.configs[payload.index]) {
            const webcam = {...state.webcam}
            webcam.configs[payload.index] = {
                name: payload.name,
                icon: payload.icon,
                service: payload.service,
                targetFps: payload.targetFps,
                url: payload.url,
                flipX: payload.flipX,
                flipY: payload.flipY,
            }

            Vue.set(state, 'webcam', webcam)
        }
    },

    deleteWebcam(state, payload) {
        if (state.webcam.configs[payload.index]) {
            state.webcam.configs.splice(payload.index, 1)
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
        const exist = state.dashboard.nonExpandPanels?.includes(payload.name) ?? false
        if (!exist) state.dashboard.nonExpandPanels.push(payload.name)
    },

    removeClosePanel(state, payload) {
        const index = state.dashboard.nonExpandPanels.indexOf(payload.name)
        if (index > -1) state.dashboard.nonExpandPanels.splice(index, 1)
    },

    storeMacrogroup(state, payload) {
        let newIndex = 0

        if (state.dashboard.macrogroups.length) {
            const lastGroup = state.dashboard.macrogroups.sort((a: GuiStateMacrogroup, b: GuiStateMacrogroup) => {
                if (a.index === null) return -1
                if (b.index === null) return 1

                return b.index - a.index
            })[0]

            newIndex = (lastGroup.index) + 1
        }
        payload.index = newIndex

        state.dashboard.macrogroups.push(payload)
    },

    destroyMacrogroup(state, payload) {
        const index = state.dashboard.macrogroups.findIndex((group: GuiStateMacrogroup) => group.index === payload)
        if (index !== -1) state.dashboard.macrogroups.splice(index, 1)
    }
}
