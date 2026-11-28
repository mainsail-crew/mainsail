import { Module } from 'vuex'
import { FileState, FileStateUpload } from '@/store/files/types'
import { actions } from '@/store/files/actions'
import { mutations } from '@/store/files/mutations'
import { getters } from '@/store/files/getters'
import { RootState } from '@/store/types'

export const getDefaultUpload = (): FileStateUpload => ({
    show: false,
    filename: '',
    currentNumber: 0,
    maxNumber: 0,
    percent: 0,
    speed: 0,
})

export const getDefaultState = (): FileState => {
    return {
        roots: {},
        directories: {},
        metadata: {},
        upload: getDefaultUpload(),
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
