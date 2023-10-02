import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { GuiMacrosState } from '@/store/gui/macros/types'

export const actions: ActionTree<GuiMacrosState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },

    saveSetting({ dispatch }, payload) {
        dispatch(
            'gui/saveSetting',
            {
                name: 'macros.' + payload.name,
                value: payload.value,
            },
            { root: true }
        )
    },

    groupUpload({ state }, id) {
        Vue.$socket.emit('server.database.post_item', {
            namespace: 'mainsail',
            key: 'macros.macrogroups.' + id,
            value: state.macrogroups[id],
        })
    },

    async groupStore({ commit, dispatch }, payload) {
        const id = uuidv4()

        await commit('groupStore', { id, values: payload.values })
        await dispatch('groupUpload', id)

        return id
    },

    groupUpdate({ commit, dispatch }, payload) {
        commit('groupUpdate', payload)
        dispatch('groupUpload', payload.id)
    },

    addMacroToMacrogroup({ commit, dispatch }, payload) {
        commit('addMacroToMacrogroup', payload)
        dispatch('groupUpload', payload.id)
    },

    updateMacroFromMacrogroup({ commit, dispatch }, payload) {
        commit('updateMacroFromMacrogroup', payload)
        dispatch('groupUpload', payload.id)
    },

    removeMacroFromMacrogroup({ commit, dispatch }, payload) {
        commit('removeMacroFromMacrogroup', payload)
        dispatch('groupUpload', payload.id)
    },

    groupDelete({ commit, dispatch, rootState }, id) {
        commit('groupDelete', id)
        Vue.$socket.emit('server.database.delete_item', { namespace: 'mainsail', key: 'macros.macrogroups.' + id })

        const layouts = [
            'mobileLayout',
            'tabletLayout1',
            'tabletLayout2',
            'desktopLayout1',
            'desktopLayout2',
            'widescreenLayout1',
            'widescreenLayout2',
            'widescreenLayout3',
        ]

        layouts.forEach((layoutname: string) => {
            // @ts-ignore
            const layoutArray = rootState.gui ? [...rootState.gui.dashboard[layoutname]] : []

            const index = layoutArray.findIndex((layoutPos: any) => layoutPos.name === 'macrogroup_' + id)
            if (index !== -1) {
                commit('gui/deleteFromDashboardLayout', { layoutname, index }, { root: true })
                dispatch(
                    'gui/updateSettings',
                    {
                        keyName: 'dashboard.' + layoutname,
                        // @ts-ignore
                        newVal: rootState.gui?.dashboard[layoutname],
                    },
                    { root: true }
                )
            }
        })
    },
}
