import { EditorLoader, EditorState } from '@/store/editor/types'
import { Module } from 'vuex'
import { actions } from '@/store/editor/actions'
import { mutations } from '@/store/editor/mutations'
import { getters } from '@/store/editor/getters'
import { RootState } from '@/store/types'

export const getDefaultLoader = (): EditorLoader => ({
    isLoading: false,
    filename: '',
    loaded: 0,
    total: 0,
    speed: '',
})

export const getDefaultState = (): EditorState => {
    return {
        bool: false,
        filename: '',
        permissions: '',
        fileroot: '',
        filepath: '',
        sourcecode: '',
        loaders: {
            download: getDefaultLoader(),
            upload: getDefaultLoader(),
        },
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
