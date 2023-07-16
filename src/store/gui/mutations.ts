import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiState } from '@/store/gui/types'
import { setDataDeep } from '@/plugins/helpers'

export const mutations: MutationTree<GuiState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setData(state, payload) {
        setDataDeep(state, payload)
    },

    saveSetting(state, payload) {
        // eslint-disable-next-line
        const deepSet = (obj: any, is: string[] | string, value: any): any => {
            if (is !== undefined && typeof is === 'string') return deepSet(obj, is.split('.'), value)
            else if (is.length == 1 && value !== undefined) return (obj[is[0]] = value)
            else if (is.length == 0) return obj
            else if (!(is[0] in obj)) obj[is[0]] = {}
            return deepSet(obj[is[0]], is.slice(1), value)
        }

        deepSet(state, payload.name, payload.value)
    },

    setHeaterChartVisibility(state, payload) {
        const index = state.view.tempchart.hiddenDataset.indexOf(payload.name.toUpperCase())

        if (payload.hidden && index === -1) state.view.tempchart.hiddenDataset.push(payload.name.toUpperCase())
        else if (payload.hidden !== true && index > -1) state.view.tempchart.hiddenDataset.splice(index, 1)
    },

    setGcodefilesMetadata(state, data) {
        const array = [...state.view.gcodefiles.hideMetadataColumns]
        const index = array.findIndex((value: string) => value === data.name)

        if (data.value && index !== -1) array.splice(index, 1)
        else if (!data.value && index === -1) array.push(data.name)

        Vue.set(state.view.gcodefiles, 'hideMetadataColumns', array)
    },

    setGcodefilesShowHiddenFiles(state, value) {
        Vue.set(state.view.gcodefiles, 'showHiddenFiles', value)
    },

    setCurrentWebcam(state, payload) {
        Vue.set(state.view.webcam.currentCam, payload.page, payload.value)
    },

    setHistoryColumns(state, data) {
        if (data.value && state.view.history.hideColums.includes(data.name)) {
            state.view.history.hideColums.splice(state.view.history.hideColums.indexOf(data.name), 1)
        } else if (!data.value && !state.view.history.hideColums.includes(data.name)) {
            state.view.history.hideColums.push(data.name)
        }
    },

    setHistoryHidePrintStatus(state, payload) {
        Vue.set(state.view.history, 'hidePrintStatus', payload)
    },

    addClosePanel(state, payload) {
        const nonExpandPanels = [...state.dashboard.nonExpandPanels[payload.viewport]]

        if (!nonExpandPanels.includes(payload.name)) {
            nonExpandPanels.push(payload.name)

            Vue.set(state.dashboard.nonExpandPanels, payload.viewport, nonExpandPanels)
        }
    },

    removeClosePanel(state, payload) {
        const nonExpandPanels = [...state.dashboard.nonExpandPanels[payload.viewport]]
        const index = nonExpandPanels.indexOf(payload.name)
        if (index > -1) {
            nonExpandPanels.splice(index, 1)

            Vue.set(state.dashboard.nonExpandPanels, payload.viewport, nonExpandPanels)
        }
    },

    deleteFromDashboardLayout(state, payload) {
        // @ts-ignore
        const layoutArray = [...state.dashboard[payload.layoutname]]
        layoutArray.splice(payload.index, 1)
        Vue.set(state.dashboard, payload.layoutname, layoutArray)
    },

    setChartDatasetStatus(state, payload: { objectName: string; dataset: string; value: boolean }) {
        // set new value if object doesn't exist in view.tempchart.datasetSettings
        if (!(payload.objectName in state.view.tempchart.datasetSettings)) {
            const newVal: { [key: string]: any } = {}
            newVal[payload.dataset] = payload.value

            Vue.set(state.view.tempchart.datasetSettings, payload.objectName, newVal)
            return
        }

        Vue.set(state.view.tempchart.datasetSettings[payload.objectName], payload.dataset, payload.value)
    },

    setDatasetAdditionalSensorStatus(state, payload: { objectName: string; dataset: string; value: boolean }) {
        // set new value if object doesn't exist in view.tempchart.datasetSettings
        if (!(payload.objectName in state.view.tempchart.datasetSettings)) {
            const newVal: { additionalSensors: { [key: string]: any } } = { additionalSensors: {} }
            newVal.additionalSensors[payload.dataset] = payload.value

            Vue.set(state.view.tempchart.datasetSettings, payload.objectName, newVal)
            return
        }

        // set new value if additionalSensor object doesn't exist in view.tempchart.datasetSettings
        if (!('additionalSensors' in state.view.tempchart.datasetSettings[payload.objectName])) {
            const newVal: { [key: string]: any } = {}
            newVal[payload.dataset] = payload.value

            Vue.set(state.view.tempchart.datasetSettings[payload.objectName], 'additionalSensors', newVal)
            return
        }

        Vue.set(
            state.view.tempchart.datasetSettings[payload.objectName].additionalSensors,
            payload.dataset,
            payload.value
        )
    },
}
