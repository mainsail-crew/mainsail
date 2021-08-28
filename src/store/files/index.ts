import { Module } from 'vuex'
import { FileState } from '@/store/files/types'
import { actions } from '@/store/files/actions'
import { mutations } from '@/store/files/mutations'
import { getters } from '@/store/files/getters'

export const getDefaultState = (): FileState => {
    return {
        filetree: [],
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const files: Module<FileState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}