import { ActionTree } from 'vuex'
import { GCodeViewerInstance, GcodeviewerState } from '@/store/gcodeviewer/types'
import { RootState } from '@/store/types'
import { markRaw } from 'vue'

export const actions: ActionTree<GcodeviewerState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    setViewerBackup({ commit }, payload: GCodeViewerInstance): void {
        commit('setValue', { key: 'viewerBackup', value: markRaw(payload) })
    },

    setCanvasBackup({ commit }, payload: HTMLCanvasElement): void {
        commit('setValue', { key: 'canvasBackup', value: payload })
    },

    setLoadedFileBackup({ commit }, payload: string | null): void {
        commit('setValue', { key: 'loadedFileBackup', value: payload })
    },
}
