import { Module } from 'vuex'
import { AFCState } from '@/store/server/afc/types'
import { actions } from '@/store/server/afc/actions'
import { mutations } from '@/store/server/afc/mutations'
import { getters } from '@/store/server/afc/getters'

export const getDefaultState = (): AFCState => {
    return {
        data: {
            units: [],
            system: {
                current_load: null,
                num_units: 0,
                num_lanes: 0,
                num_extruders: 0,
                extruders: [],
            },
            laneList: [],
            mapList: [],
            bypass_status: false,
        },
        activeUnit: null,
        activeLane: null,
    }
}

// Initial state
const state = getDefaultState()

// Vuex Module
export const afc: Module<AFCState, any> = {
    namespaced: true,
    state,
    mutations,
    getters,
    actions,
}
