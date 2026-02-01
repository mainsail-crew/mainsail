import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { GuiMacrosState } from '@/store/gui/macros/types'
import { GuiState, GuiStateLayoutoption } from '@/store/gui/types'

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

    async groupDelete({ commit, dispatch, rootState }, id) {
        commit('groupDelete', id)
        await Vue.$socket.emitAndWait('server.database.delete_item', {
            namespace: 'mainsail',
            key: `macros.macrogroups.${id}`,
        })

        type DashboardLayoutKey = Exclude<keyof GuiState['dashboard'], 'nonExpandPanels'>
        const layouts = Object.keys(rootState.gui?.dashboard ?? {}).filter(
            (key) => key !== 'nonExpandPanels'
        ) as DashboardLayoutKey[]

        for (const layoutname of layouts) {
            const macrogroupId = `macrogroup_${id}`
            const layoutArray: GuiStateLayoutoption[] = [...(rootState.gui?.dashboard[layoutname] ?? [])]
            const index = layoutArray.findIndex((layoutPos) => layoutPos.name === macrogroupId)

            if (index === -1) continue

            layoutArray.splice(index, 1)
            dispatch('gui/saveSetting', { name: `dashboard.${layoutname}`, value: layoutArray }, { root: true })
        }
    },
}
