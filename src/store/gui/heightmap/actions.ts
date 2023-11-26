import { ActionTree } from 'vuex'
import { RootState } from '../../types'
import { HeightmapState } from './types'

export const actions: ActionTree<HeightmapState, RootState> = {
    saveActiveColorScheme({ commit }, payload: string) {
        commit('saveActiveColorScheme', payload)
    },

    saveSetting({ dispatch }, payload) {
        dispatch(
            'gui/saveSetting',
            {
                name: 'heightmap.' + payload.name,
                value: payload.value,
            },
            { root: true }
        )
    },
}
