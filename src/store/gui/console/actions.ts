import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { GuiConsoleState } from '@/store/gui/console/types'

export const actions: ActionTree<GuiConsoleState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    clear({ commit }) {
        const cleared_since = new Date().valueOf()
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'console.cleared_since',
            value: cleared_since,
        })

        commit('clear', {
            cleared_since,
        })

        commit('server/clearGcodeStore', {}, { root: true })
        commit('server/setConsoleClearedThisSession', {}, { root: true })
    },

    saveSetting({ dispatch }, payload) {
        dispatch(
            'gui/saveSetting',
            {
                name: 'console.' + payload.name,
                value: payload.value,
            },
            { root: true }
        )
    },

    filterUpload(_, payload) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'console.consolefilters.' + payload.id,
            value: payload.value,
        })
    },

    filterStore({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        commit('filterStore', { id, values: payload.values })
        dispatch('filterUpload', {
            id,
            value: state.consolefilters[id],
        })
    },

    filterUpdate({ commit, dispatch, state }, payload) {
        commit('filterUpdate', payload)
        dispatch('filterUpload', {
            id: payload.id,
            value: state.consolefilters[payload.id],
        })
    },

    filterDelete({ commit }, payload) {
        commit('filterDelete', payload)
        Vue.$socket.emit('server.database.delete_item', {
            namespace: 'mainsail',
            key: 'console.consolefilters.' + payload,
        })
    },
}
