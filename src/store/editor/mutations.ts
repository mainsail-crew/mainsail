import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { EditorState } from '@/store/editor/types'
import Vue from 'vue'
import { hashEditorContent } from '@/plugins/helpers'

export const mutations: MutationTree<EditorState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    updateLoaderState(state, value: boolean): void {
        Vue.set(state, 'isLoading', value)
    },

    updateLoader(state, progress: EditorState['loaderProgress']): void {
        Vue.set(state, 'loaderProgress', progress)
    },

    openFile(
        state,
        payload: { filename: string; fileroot: string; filepath: string; permissions: string; file: string }
    ): void {
        Vue.set(state, 'filename', payload.filename)
        Vue.set(state, 'fileroot', payload.fileroot)
        Vue.set(state, 'filepath', payload.filepath)
        Vue.set(state, 'permissions', payload.permissions)
        Vue.set(state, 'sourcecode', payload.file)
        Vue.set(state, 'loadedHash', hashEditorContent(payload.file))
        Vue.set(state, 'changed', false)
        Vue.set(state, 'bool', true)
    },

    resetLoader(state): void {
        Vue.set(state, 'isLoading', false)
        Vue.set(state, 'loaderProgress', getDefaultState().loaderProgress)
    },

    setFilename(state, filename: string): void {
        Vue.set(state, 'filename', filename)
    },

    updateSourcecode(state, sourcecode: string): void {
        Vue.set(state, 'sourcecode', sourcecode)

        // To check if a file has been changed by the user, we need to calculate a hash
        // (or otherwise we would need to save the full file in memory twice). Simply listening
        // to the changed event is not enough, because if the user types an "a" and then deletes
        // the "a" again, the file would still be shown as changed, even though the edited file
        // is equal to the stored file.

        // I've tested this functionality with huge text files (60MB G-Code) and while calculating
        // the hash took 2 seconds per run, the editor itself is pretty laggy even without hash
        // calculations. Hash calculations with typical config file sizes (50KB) only take 1 or 2ms
        // on my machine, so I guess this is acceptable for most use cases.

        Vue.set(state, 'changed', hashEditorContent(sourcecode) !== state.loadedHash)
    },

    updateLoadedHash(state, hash: string): void {
        Vue.set(state, 'loadedHash', hash)
        Vue.set(state, 'changed', false)
    },
}
