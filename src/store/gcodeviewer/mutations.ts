import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GcodeviewerState } from '@/store/gcodeviewer/types'
import { markRaw } from 'vue'

export const mutations: MutationTree<GcodeviewerState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setViewerBackup(state, backup) {
        state.viewerBackup = markRaw(backup) /* viewer object is large and quite slow to proxy */
    },

    setCanvasBackup(state, backup) {
        state.canvasBackup = backup
    },

    setLoadedFileBackup(state, backup) {
        state.loadedFileBackup = backup
    },
}
