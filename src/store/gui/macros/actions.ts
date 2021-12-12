import { ActionTree } from 'vuex'
import {RootState} from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import {GuiMacrosState} from '@/store/gui/macros/types'

export const actions: ActionTree<GuiMacrosState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    init() {
        window.console.debug('init gui/macros')
        Vue.$socket.emit('server.database.get_item', { namespace: 'mainsail_macrogroups' }, { action: 'gui/macros/initStore' })
    },

    initStore({ commit }, payload) {
        commit('reset')
        commit('initStore', payload)
    },

    saveSetting({ commit }, payload) {
        commit('saveSetting', payload)

        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: 'macros.'+payload.name, value: payload.value })
    },

    upload({ state }, id) {
        Vue.$socket.emit('server.database.post_item', { namespace: 'mainsail', key: 'macros.macrogroups.'+id, value: state.macrogroups[id] })
    },

    async store({ commit, dispatch, state }, payload) {
        const id = uuidv4()

        await commit('store', { id, values: payload.values })
        await dispatch('upload', id)

        return id
    },

    update({ commit, dispatch, state }, payload) {
        commit('update', payload)
        dispatch('upload', payload.id)
    },

    addMacroToMacrogroup({ commit, dispatch }, payload) {
        commit('addMacroToMacrogroup', payload)
        dispatch('upload', payload.id)
    },

    updateMacroFromMacrogroup({ commit, dispatch }, payload) {
        commit('updateMacroFromMacrogroup', payload)
        dispatch('upload', payload.id)
    },

    removeMacroFromMacrogroup({ commit, dispatch }, payload) {
        commit('removeMacroFromMacrogroup', payload)
        dispatch('upload', payload.id)
    },

    delete({ commit, dispatch, rootState }, id) {
        commit('delete', id)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail_macrogroups', key: id })

        const layouts = ['mobileLayout', 'tabletLayout1', 'tabletLayout2', 'desktopLayout1', 'desktopLayout2',
            'widescreenLayout1', 'widescreenLayout2', 'widescreenLayout3']

        layouts.forEach((layoutname: string) => {
            // @ts-ignore
            const layoutArray = [...rootState.gui?.dashboard[layoutname]]

            const index = layoutArray.findIndex((layoutPos: any) => layoutPos.name === 'macrogroup_'+id)
            if (index !== -1) {
                commit('gui/deleteFromDashboardLayout', { layoutname, index }, { root: true })
                dispatch('gui/updateSettings', {
                    keyName: 'dashboard.'+layoutname,
                    // @ts-ignore
                    newVal: rootState.gui?.dashboard[layoutname]
                }, { root: true })
            }
        })
    },
}