import { EditorState } from '@/store/editor/types'
import { Module } from 'vuex'
import { actions } from '@/store/editor/actions'
import { mutations } from '@/store/editor/mutations'
import { getters } from '@/store/editor/getters'

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
            lastTimestamp: 0,
            lastLoaded: 0,
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

export const editor: Module<EditorState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
