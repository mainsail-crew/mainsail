import { getDefaultState } from './index'
import Vue from 'vue'
import { MutationTree } from 'vuex'
import { PrinterTempHistoryState, PrinterTempHistoryStateSerie } from '@/store/printer/tempHistory/types'

export const mutations: MutationTree<PrinterTempHistoryState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setInitSource(state, payload) {
        Vue.set(state, 'source', payload)
    },

    setInitSeries(state, payload) {
        Vue.set(state, 'series', payload)
    },

    addToSource(state, payload) {
        const newSource = [...state.source]
        newSource.push(payload.data)
        while (newSource.length > payload.maxHistory) newSource.splice(0, 1)

        Vue.set(state, 'source', newSource)
    },

    // function for debugging tempchart update interval (browser sleep)
    saveLastDate(state, payload) {
        Vue.set(state, 'timeLastUpdate', payload)
    },

    setUpdateSourceInterval(state, payload) {
        Vue.set(state, 'updateSourceInterval', payload)
    },

    setColor(state, payload) {
        state.series
            .filter((serie: PrinterTempHistoryStateSerie) => {
                return payload.name === serie.name || serie.name.startsWith(payload.name + '-')
            })
            .forEach((serie: PrinterTempHistoryStateSerie) => {
                serie.color = payload.value
                serie.lineStyle.color = payload.value
                serie.emphasis.lineStyle.color = payload.value

                if (serie.name.endsWith('-target')) {
                    const areaStyle = serie.areaStyle
                    if (areaStyle) areaStyle.color = payload.value

                    const areaStyle2 = serie.emphasis?.areaStyle
                    if (areaStyle2) areaStyle2.color = payload.value
                }
            })
    },
}
