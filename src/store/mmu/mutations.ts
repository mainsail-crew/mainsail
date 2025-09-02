import { MutationTree } from 'vuex'
import { getDefaultGateMapState, getDefaultTtgMapState } from './index'
import { MmuGateMapEditorState, MmuTtgMapEditorState, MmuGateDetails } from '@/store/mmu/types'

export const gateMapMutations: MutationTree<MmuGateMapEditorState> = {
    reset(state) {
        Object.assign(state, getDefaultGateMapState())
    },

    setMap(s: MmuGateMapEditorState, map: MmuGateDetails[]) {
        // Clone to avoid retaining external references
        s.gateMap = map ? map.map((g) => ({ ...g })) : []
    },

    clearMap(s: MmuGateMapEditorState) {
        s.gateMap = []
    },

    setSelectedGate(s: MmuGateMapEditorState, index: number) {
        s.gateSelected = index
    },

    // Merge a partial patch into a single gate (reactively)
    patchGate(s: MmuGateMapEditorState, patch: Partial<MmuGateDetails>) {
        const index = s.gateSelected
        if (index < 0 || index >= s.gateMap.length) return
        const gate = s.gateMap[index]
        // replace with a new object to keep reactivity impeccable
        s.gateMap.splice(index, 1, { ...gate, ...patch })
    },

    incrementSpeed(s: MmuGateMapEditorState) {
        const index = s.gateSelected
        if (index < 0 || index >= s.gateMap.length) return
        const v = Math.min(150, Math.round(s.gateMap[index].speedOverride + 10))
        s.gateMap.splice(index, 1, { ...s.gateMap[index], speedOverride: v })
    },

    decrementSpeed(s: MmuGateMapEditorState) {
        const index = s.gateSelected
        if (index < 0 || index >= s.gateMap.length) return
        const v = Math.max(10, Math.round(s.gateMap[index].speedOverride - 10))
        s.gateMap.splice(index, 1, { ...s.gateMap[index], speedOverride: v })
    },

    resetSpeed(s: MmuGateMapEditorState) {
        const index = s.gateSelected
        if (index < 0 || index >= s.gateMap.length) return
        s.gateMap.splice(index, 1, { ...s.gateMap[index], speedOverride: 100 })
    },
}

export const ttgMapMutations: MutationTree<MmuTtgMapEditorState> = {
    reset(state) {
        Object.assign(state, getDefaultTtgMapState())
    },

    setTtgMap(s, map: number[] = []) {
        s.ttgMap = map.slice()
    },

    setEndlessSpoolGroups(s, groups: number[] = []) {
        s.endlessSpoolGroups = groups.slice()
    },

    setGateMap(s, map: MmuGateDetails[] = []) {
        // Clone each entry to decouple from external references
        s.gateMap = map.map((g) => ({ ...g }))
    },

    // Set mapping for a single tool -> gate
    mapToolGate(s, payload: { tool: number; gate: number }) {
        const { tool, gate } = payload
        if (tool < 0) return
        if (!Array.isArray(s.ttgMap)) s.ttgMap = []
        if (tool >= s.ttgMap.length) s.ttgMap.length = tool + 1
        s.ttgMap.splice(tool, 1, gate)
    },

    // Set Endless Spool group for a specific gate index
    mapGateGroup(s, payload: { gate: number; group: number }) {
        const { gate, group } = payload
        if (gate < 0) return
        if (!Array.isArray(s.endlessSpoolGroups)) s.endlessSpoolGroups = []
        if (gate >= s.endlessSpoolGroups.length) s.endlessSpoolGroups.length = gate + 1
        s.endlessSpoolGroups.splice(gate, 1, group)

        // Also reflect on gateMap if present
        if (Array.isArray(s.gateMap) && gate < s.gateMap.length && s.gateMap[gate]) {
            s.gateMap.splice(gate, 1, { ...s.gateMap[gate], endlessSpoolGroup: group })
        }
    },
}
