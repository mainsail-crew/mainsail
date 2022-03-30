import { ActionTree } from 'vuex'
import { NotificationState } from '@/store/notification/types'
import { RootState } from '@/store/types'

export const actions: ActionTree<NotificationState, RootState> = {
    reset({ commit }) {
        commit('reset')
    },
}
