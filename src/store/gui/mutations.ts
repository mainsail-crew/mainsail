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

    saveSetting(state, payload: { name: string; value: any }) {
        const deepSet = (obj: any, is: string[] | string, value: any): any => {
            if (is !== undefined && typeof is === 'string') return deepSet(obj, is.split('.'), value)
            else if (is?.length === 1 && value !== undefined) return Vue.set(obj, is[0], value)
            else if (is?.length === 0) return obj
            else if (!(is[0] in obj)) Vue.set(obj, is[0], {})

            return deepSet(obj[is[0]], is?.slice(1), value)
        }

        deepSet(state, payload.name, payload.value)
    },

    setHeaterChartVisibility(state, payload) {
        const index = state.view.tempchart.hiddenDataset.indexOf(payload.name.toUpperCase())

        if (payload.hidden && index === -1) state.view.tempchart.hiddenDataset.push(payload.name.toUpperCase())
        else if (payload.hidden !== true && index > -1) state.view.tempchart.hiddenDataset.splice(index, 1)
    },

    deleteFromDashboardLayout(state, payload) {
        // @ts-ignore
        const layoutArray = [...state.dashboard[payload.layoutname]]
        layoutArray.splice(payload.index, 1)
        Vue.set(state.dashboard, payload.layoutname, layoutArray)
    },
}
