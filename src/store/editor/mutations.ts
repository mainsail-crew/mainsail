import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { EditorState } from '@/store/editor/types'
import Vue from 'vue'
import { sha256 } from 'js-sha256'

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

        // Because the used editor converts all Windows-Style line endings with unix ones on load,
        // the hash is computed with the source always having unix-style line endings.
        // https://github.com/codemirror/CodeMirror/issues/3395

        Vue.set(state, 'loadedHash', sha256(payload.file.replace(/(?:\r\n|\r|\n)/g, '\n')))
        Vue.set(state, 'changed', false)
        Vue.set(state, 'bool', true)
    },

    showEditor(state) {
        Vue.set(state, 'bool', true)
    },

    setFilename(state, filename) {
        Vue.set(state, 'filename', filename)
    },

    setPermissions(state, filename) {
        Vue.set(state, 'permissions', filename)
    },

    hideEditor(state) {
        Vue.set(state, 'bool', false)
    },

    updateSourcecode(state, payload) {
        Vue.set(state, 'sourcecode', payload)

        // To check if a file has been changed by the user, we need to calculate a hash
        // (or otherwise we would need to save the full file in memory twice). Simply listening
        // to the changed event is not enough, because if the user types an "a" and then deletes
        // the "a" again, the file would still be shown as changed, even though the edited file
        // is equal to the stored file.

        // I've tested this functionality with huge text files (60MB G-Code) and while calculating
        // the hash took 2 seconds per run, the editor itself is pretty laggy even without hash
        // calculations. Hash calculations with typical config file sizes (50KB) only take 1 or 2ms
        // on my machine, so I guess this is acceptable for most use cases.

        state.changed = sha256(payload) != state.loadedHash
    },

    updateLoadedHash(state, payload) {
        Vue.set(state, 'loadedHash', sha256(payload.replace(/(?:\r\n|\r|\n)/g, '\n')))
        Vue.set(state, 'changed', false)
    },
}
