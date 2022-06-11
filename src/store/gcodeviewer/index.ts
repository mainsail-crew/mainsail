import { GcodeviewerState } from '@/store/gcodeviewer/types'
import { Module } from 'vuex'
import { actions } from '@/store/gcodeviewer/actions'
import { mutations } from '@/store/gcodeviewer/mutations'
import { getters } from '@/store/gcodeviewer/getters'

export const getDefaultState = (): GcodeviewerState => {
    return {
        viewerBackup: null,
        canvasBackup: null,
        loadedFileBackup: null,
    }
}

// initial state
const state = getDefaultState()

export const gcodeviewer: Module<GcodeviewerState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
