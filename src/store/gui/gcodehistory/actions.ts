import { ActionTree } from 'vuex'
import {RootState} from '@/store/types'
import Vue from 'vue'
import {GuiGcodehistoryState} from '@/store/gui/gcodehistory/types'
import {maxGcodeHistory} from '@/store/variables'

export const actions: ActionTree<GuiGcodehistoryState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.debug('init gui/gcodehistory')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail_gcodehistory' }, { action: 'gui/gcodehistory/initStore' })
    },

    initStore({ commit }, payload) {
        commit('reset')
        commit('initStore', payload)
    },

    upload({ state }) {
        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail_gcodehistory', key: 'history', value: state.history })
    },

    async addToHistory({ commit, dispatch, state }, payload) {
        const newHistory = [...state.history]
        newHistory.push(payload)

        while (newHistory.length > maxGcodeHistory) newHistory.splice(0, 1)

        await commit('updateHistory', newHistory)
        await dispatch('upload')
    }
}