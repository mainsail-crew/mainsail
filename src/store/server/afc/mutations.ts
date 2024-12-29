import { getDefaultState } from './index'
import Vue from 'vue'
import { MutationTree } from 'vuex'
import { AFCState, Unit, Lane, System } from '@/store/server/afc/types'

export const mutations: MutationTree<AFCState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    updateSystem(state, system: System | null) {
        Vue.set(state.data, 'system', system)
    },

    setLaneList(state, laneList) {
        Vue.set(state.data, 'laneList', laneList)
    },

    setMapList(state, mapList) {
        Vue.set(state.data, 'mapList', mapList)
    },

    setUnits(state, units: Unit[]) {
        Vue.set(state.data, 'units', units)
    },

    setActiveUnit(state, unit: Unit | null) {
        Vue.set(state.data, 'activeUnit', unit)
    },

    setActiveLane(state, lane: Lane | null) {
        Vue.set(state.data, 'activeLane', lane)
    },
}
