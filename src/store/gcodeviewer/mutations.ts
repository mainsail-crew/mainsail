import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GcodeviewerState } from '@/store/gcodeviewer/types'
import Vue, { markRaw } from 'vue'

export const mutations: MutationTree<GcodeviewerState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setViewerBackup(state, backup) {
        Vue.set(state, 'viewerBackup', markRaw(backup) /* viewer object is large and quite slow to proxy */)
    },

    setCanvasBackup(state, backup) {
        Vue.set(state, 'canvasBackup', backup)
    },

    setLoadedFileBackup(state, backup) {
        Vue.set(state, 'loadedFileBackup', backup)
    },
}
