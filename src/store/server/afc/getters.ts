import { GetterTree } from 'vuex'
import { AFCState, Unit, Lane, Extruder, Message } from '@/store/server/afc/types'
import { RootState } from '@/store/types'
import { get } from 'http'

export const getters: GetterTree<AFCState, RootState> = {
    getUnits: (state): Unit[] => {
        return state.data.units
    },

    getLane:
        (state) =>
        (laneName: string): Lane | null => {
            return state.data.lanes.find((lane) => lane.name === laneName) || null
        },

    getLaneList: (state): string[] => {
        return state.data.laneList
    },

    getMapList: (state): string[] => {
        return state.data.mapList
    },

    getMessage: (state): Message => {
        return state.data.message
    },

    getCurrentLoad: (state): Lane | null => {
        return state.data.current_load
    },

    getCurrentLane: (state): Lane | null => {
        return state.data.current_lane
    },

    getNextLane: (state): Lane | null => {
        return state.data.next_lane
    },

    getCurrentToolchange: (state): number => {
        return state.data.current_toolchange
    },

    getNumberToolchange: (state): number => {
        return state.data.number_toolchange
    },

    getCurrentState: (state): string => {
        return state.data.current_state
    },

    getExtruders: (state): Extruder[] => {
        return state.data.extruders || []
    },

    getBypassStatus: (state): boolean => {
        return state.data.bypass_status
    },

    getExtruder:
        (state) =>
        (extruderName: string): Extruder | null => {
            return state.data.extruders.find((extruder) => extruder.name === extruderName) || null
        },
}
