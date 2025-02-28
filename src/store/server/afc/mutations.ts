import { getDefaultState } from './index'
import Vue from 'vue'
import { MutationTree } from 'vuex'
import { AFCState, Unit, Lane, Extruder, Hub, FilBuffer } from '@/store/server/afc/types'

export const mutations: MutationTree<AFCState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setLaneList(state, laneList) {
        Vue.set(state, 'laneList', laneList)
    },

    setMapList(state, mapList) {
        Vue.set(state, 'mapList', mapList)
    },

    setUnits(state, units: Unit[]) {
        Vue.set(state, 'units', units)
    },

    setLanes(state, lanes: Lane[]) {
        Vue.set(state, 'lanes', lanes)
    },

    setHubs(state, hubs: Hub[]) {
        Vue.set(state, 'hubs', hubs)
    },

    setExtruders(state, extruders: Extruder[]) {
        Vue.set(state, 'extruders', extruders)
    },

    setBuffers(state, buffers: FilBuffer[]) {
        Vue.set(state, 'buffers', buffers)
    },

    setCurrentLoad(state, currentLoad: Lane | null) {
        Vue.set(state, 'current_load', currentLoad)
    },

    setNextLane(state, nextLoad: Lane | null) {
        Vue.set(state, 'next_lane', nextLoad)
    },

    setCurrentLane(state, currentLane: Lane | null) {
        Vue.set(state, 'current_lane', currentLane)
    },
}
