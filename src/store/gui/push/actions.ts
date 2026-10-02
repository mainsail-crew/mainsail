import { ActionTree } from 'vuex'
import { RootState } from '../../types'
import { GuiPushState } from './types'

export const actions: ActionTree<GuiPushState, RootState> = {
    saveSetting({ dispatch }, payload) {
        dispatch(
            'gui/saveSetting',
            {
                name: 'push.' + payload.name,
                value: payload.value,
            },
            { root: true }
        )
    },
}
