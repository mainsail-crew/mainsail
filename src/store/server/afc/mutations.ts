import { getDefaultState } from './index'
import Vue from 'vue'
import { MutationTree } from 'vuex'
import { AFCState, Unit, Lane, Extruder, Hub, FilBuffer, Message } from '@/store/server/afc/types'
import { set } from 'vue/types/umd'

export const mutations: MutationTree<AFCState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setLaneList(state, laneList) {
        Vue.set(state.data, 'laneList', laneList)
    },

    setMapList(state, mapList) {
        Vue.set(state.data, 'mapList', mapList)
    },

    setMessage(state, message: Message | null) {
        Vue.set(state.data, 'message', message)
    },

    clearMessage(state) {
        Vue.set(state.data, 'message', { type: '', message: '' })
    },

    setUnits(state, units: Unit[]) {
        Vue.set(state.data, 'units', units)
    },

    setHubs(state, hubs: Hub[]) {
        Vue.set(state.data, 'hubs', hubs)
    },

    setExtruders(state, extruders: Extruder[]) {
        Vue.set(state.data, 'extruders', extruders)
    },

    setBuffers(state, buffers: FilBuffer[]) {
        Vue.set(state.data, 'buffers', buffers)
    },

    setCurrentLoad(state, currentLoad: Lane | null) {
        Vue.set(state.data, 'current_load', currentLoad)
    },

    setNextLane(state, nextLoad: Lane | null) {
        Vue.set(state.data, 'next_lane', nextLoad)
    },

    setCurrentToolchange(state, currentToolchange: number) {
        Vue.set(state.data, 'current_toolchange', currentToolchange)
    },

    setNumberToolchange(state, numberToolchange: number) {
        Vue.set(state.data, 'number_toolchange', numberToolchange)
    },

    setCurrentLane(state, currentLane: Lane | null) {
        Vue.set(state.data, 'current_lane', currentLane)
    },

    setCurrentState(state, currentState: string) {
        Vue.set(state.data, 'current_state', currentState)
    },
}
