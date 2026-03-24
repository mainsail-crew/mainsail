import { Module } from 'vuex'
import { FileState } from '@/store/files/types'
import { actions } from '@/store/files/actions'
import { mutations } from '@/store/files/mutations'
import { getters } from '@/store/files/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): FileState => {
    return {
        filetree: [],
        upload: {
            show: false,
            filename: '',
            currentNumber: 0,
            maxNumber: 0,
            cancelTokenSource: null,
            percent: 0,
            speed: 0,
        },
    }
}

// initial state
const state = getDefaultState()

export const files: Module<FileState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
