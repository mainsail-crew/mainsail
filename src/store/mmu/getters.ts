import type { GetterTree } from 'vuex'
import type { MmuGateMapEditorState, MmuTtgMapEditorState } from '@/store/mmu/types'

// eslint-disable-next-line
export const gateMapGetters: GetterTree<MmuGateMapEditorState, any> = {
    gateMap: (s: MmuGateMapEditorState) => s.gateMap,

    selectedGate: (s: MmuGateMapEditorState) => s.gateSelected,

    selectedGateDetails: (s: MmuGateMapEditorState) =>
        s.gateSelected >= 0 && s.gateSelected < s.gateMap.length ? s.gateMap[s.gateSelected] : null,

    byIndex: (s: MmuGateMapEditorState) => (idx: number) =>
        idx >= 0 && idx < s.gateMap.length ? s.gateMap[idx] : null,
}

// eslint-disable-next-line
export const ttgMapGetters: GetterTree<MmuTtgMapEditorState, any> = {
    ttgMap: (s: MmuTtgMapEditorState) => s.ttgMap,

    endlessSpoolGroups: (s: MmuTtgMapEditorState) => s.endlessSpoolGroups,

    gateMap: (s: MmuTtgMapEditorState) => s.gateMap,
}
