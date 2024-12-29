import { GetterTree } from 'vuex'
import { AFCState, Unit, Lane, System, Extruder } from '@/store/server/afc/types'
import { RootState } from '@/store/types'

export const getters: GetterTree<AFCState, RootState> = {
    getUnits: (state): Unit[] => {
        return state.data.units
    },

    getLane:
        (state) =>
        (unitName: string, laneName: string): Lane | null => {
            const unit = state.data.units.find((unit) => unit.system.type === unitName)
            return unit?.lanes.find((lane) => lane.laneName === laneName) || null
        },

    getLaneList: (state): string[] => {
        return state.data.laneList
    },

    getMapList: (state): string[] => {
        return state.data.mapList
    },

    getActiveUnit: (state): Unit | null => {
        return state.activeUnit
    },

    getActiveLane: (state): Lane | null => {
        return state.activeLane
    },

    getSystemInfo: (state): System => {
        return state.data.system
    },

    getExtruders: (state): any[] => {
        return state.data.system.extruders || []
    },

    getExtruder:
        (state) =>
        (extruderName: string): Extruder | null => {
            return state.data.system.extruders?.find((extruder) => extruder.name === extruderName) || null
        },
}
