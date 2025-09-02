import { Module } from 'vuex'
import { gateMapActions, ttgMapActions } from '@/store/mmu/actions'
import { gateMapMutations, ttgMapMutations } from '@/store/mmu/mutations'
import { gateMapGetters, ttgMapGetters } from '@/store/mmu/getters'
import type { MmuGateMapEditorState, MmuTtgMapEditorState } from '@/store//mmu/types'

export const getDefaultGateMapState = (): MmuGateMapEditorState => {
    return {
        gateMap: [],
        gateSelected: -1, // TOOL_GATE_UNKNOWN
    }
}

// eslint-disable-next-line
export const mmuGateMapEditor: Module<MmuGateMapEditorState, any> = {
    namespaced: true,
    state: getDefaultGateMapState,
    getters: gateMapGetters,
    actions: gateMapActions,
    mutations: gateMapMutations,
}

export const getDefaultTtgMapState = (): MmuTtgMapEditorState => ({
    ttgMap: [],
    endlessSpoolGroups: [],
    gateMap: [],
})

// eslint-disable-next-line
export const mmuTtgMapEditor: Module<MmuTtgMapEditorState, any> = {
    namespaced: true,
    state: getDefaultTtgMapState,
    getters: ttgMapGetters,
    actions: ttgMapActions,
    mutations: ttgMapMutations,
}
