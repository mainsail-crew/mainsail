import { Module } from 'vuex'
import type { CncStatus } from '@/types/cnc'
import { RootState } from '@/store/types'

export interface CncState {
    enabled: boolean
    status: CncStatus | null
}

const state = (): CncState => ({
    enabled: false,
    status: null,
})

export const cnc: Module<CncState, RootState> = {
    namespaced: true,
    state,
    getters: {
        isEnabled: (state, getters, rootState) => state.enabled || rootState.gui?.gcodeViewer?.cncMode === true,
        status: (state) => state.status,
        machinePosition: (state, getters, rootState) => {
            const pos = rootState.printer?.motion_report?.live_position ?? [0, 0, 0]
            return {
                x: pos[0] ?? 0,
                y: pos[1] ?? 0,
                z: pos[2] ?? 0,
            }
        },
        workPosition: (state, getters, rootState) => {
            const pos = rootState.printer?.gcode_move?.gcode_position ?? [0, 0, 0]
            return {
                x: pos[0] ?? 0,
                y: pos[1] ?? 0,
                z: pos[2] ?? 0,
            }
        },
        workOffset: (state, getters) => {
            const machine = getters.machinePosition
            const work = getters.workPosition
            return {
                x: machine.x - work.x,
                y: machine.y - work.y,
                z: machine.z - work.z,
            }
        },
        axisMinimum: (state, getters, rootState) => {
            const limits = rootState.printer?.toolhead?.axis_minimum ?? [0, 0, 0]
            return {
                x: limits[0] ?? 0,
                y: limits[1] ?? 0,
                z: limits[2] ?? 0,
            }
        },
        axisMaximum: (state, getters, rootState) => {
            const limits = rootState.printer?.toolhead?.axis_maximum ?? [0, 0, 0]
            return {
                x: limits[0] ?? 0,
                y: limits[1] ?? 0,
                z: limits[2] ?? 0,
            }
        },
        liveVelocity: (state, getters, rootState) => rootState.printer?.motion_report?.live_velocity ?? 0,
        homedAxes: (state, getters, rootState) => rootState.printer?.toolhead?.homed_axes ?? '',
        absoluteCoordinates: (state, getters, rootState) => rootState.printer?.gcode_move?.absolute_coordinates ?? true,
    },
    mutations: {
        setEnabled(state, value: boolean) {
            state.enabled = value
        },
        setStatus(state, value: CncStatus | null) {
            state.status = value
        },
    },
    actions: {
        async init({ commit }) {
            commit('setEnabled', true)
        },
    },
}
