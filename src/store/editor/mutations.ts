import { getDefaultState } from './index'
import {MutationTree} from 'vuex'
import {EditorState} from '@/store/editor/types'
import Vue from 'vue'

export const mutations: MutationTree<EditorState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    updateCancelTokenSource(state, source) {
        Vue.set(state, 'cancelToken', source)
    },

    updateLoaderState(state, value) {
        Vue.set(state, 'loaderBool', value)
    },

    updateLoader(state, payload) {
        Vue.set(state, 'loaderProgress', payload)
    },

    openFile(state, payload) {
        Vue.set(state, 'filename', payload.filename)
        Vue.set(state, 'fileroot', payload.fileroot)
        Vue.set(state, 'filepath', payload.filepath)
        Vue.set(state, 'sourcecode', payload.file)
        Vue.set(state, 'bool', true)
    },

    showEditor(state) {
        Vue.set(state, 'bool', true)
    },

    setFilename(state, filename) {
        Vue.set(state, 'filename', filename)
    },

    hideEditor(state) {
        Vue.set(state, 'bool', false)
    },

    updateSourcecode(state, payload) {
        Vue.set(state, 'sourcecode', payload)
    }
}
