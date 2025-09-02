import { ActionTree } from 'vuex'
import { MmuGateMapEditorState, MmuTtgMapEditorState, MmuGateDetails } from '@/store/mmu/types'
import { RootState } from '@/store/types'

export const gateMapActions: ActionTree<MmuGateMapEditorState, RootState> = {
    init(
        { commit },
        payload: {
            gateMap: MmuGateDetails[]
            selected?: number
        }
    ) {
        commit('setMap', payload.gateMap || [])
        commit('setSelectedGate', payload.selected ?? -1) // TOOL_GATE_UNKNOWN
    },

    select({ commit, state }, index: number) {
        const newIndex = state.gateSelected === index ? -1 : index // TOOL_GATE_UNKNOWN
        commit('setSelectedGate', newIndex)
    },
}

export const ttgMapActions: ActionTree<MmuTtgMapEditorState, RootState> = {
    init(
        { commit },
        payload: {
            ttgMap: number[]
            endlessSpoolGroups: number[]
            gateMap: MmuGateDetails[]
        }
    ) {
        commit('setTtgMap', payload.ttgMap ?? [])
        commit('setEndlessSpoolGroups', payload.endlessSpoolGroups ?? [])
        commit('setGateMap', payload.gateMap ?? [])
    },
}
