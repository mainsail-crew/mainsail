import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiNotificationState } from './types'

export const mutations: MutationTree<GuiNotificationState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },
}
