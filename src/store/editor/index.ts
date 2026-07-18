import { EditorState } from '@/store/editor/types'
import { Module } from 'vuex'
import { actions } from '@/store/editor/actions'
import { mutations } from '@/store/editor/mutations'
import { getters } from '@/store/editor/getters'
import { RootState } from '@/store/types'

export const getDefaultState = (): EditorState => {
    return {
        bool: false,
        filename: '',
        permissions: '',
        fileroot: '',
        filepath: '',
        sourcecode: '',
        loaderBool: false,
        loaderProgress: {
            direction: 'downloading',
            loaded: 0,
            total: 0,
            speed: '',
        },
        cancelToken: null,
        loadedHash: '',
        changed: false,
    }
}

// initial state
const state = getDefaultState()

export const editor: Module<EditorState, RootState> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
