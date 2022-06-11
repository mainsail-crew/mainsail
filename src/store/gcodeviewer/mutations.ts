import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GcodeviewerState } from '@/store/gcodeviewer/types'
import Vue from 'vue'

export const mutations: MutationTree<GcodeviewerState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    setViewerBackup(state, backup) {
        Vue.set(state, 'viewerBackup', backup)
    },

    setCanvasBackup(state, backup) {
        Vue.set(state, 'canvasBackup', backup)
    },

    setLoadedFileBackup(state, backup) {
        Vue.set(state, 'loadedFileBackup', backup)
    },
}
