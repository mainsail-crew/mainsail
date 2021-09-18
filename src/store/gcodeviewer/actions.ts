import {ActionTree} from 'vuex'
import {GcodeviewerState} from '@/store/gcodeviewer/types'
import {RootState} from '@/store/types'

export const actions: ActionTree<GcodeviewerState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    setCanvasBackup({ commit }, backup) {
        commit('setCanvasBackup', backup)
    },

    setLoadedFileBackup({ commit }, backup) {
        commit('setLoadedFileBackup', backup)
    }
}