import { Module } from 'vuex'
import { AFCState } from '@/store/server/afc/types'
import { actions } from '@/store/server/afc/actions'
import { mutations } from '@/store/server/afc/mutations'
import { getters } from '@/store/server/afc/getters'

export const getDefaultState = (): AFCState => {
    return {
        data: {
            units: [],
            current_load: null,
            current_lane: null,
            next_lane: null,
            current_state: '',
            current_toolchange: 0,
            number_toolchange: 0,
            lanes: [],
            buffers: [],
            hubs: [],
            extruders: [],
            laneList: [],
            mapList: [],
            bypass_status: false,
            message: {
                type: '',
                message: '',
            },
        },
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
