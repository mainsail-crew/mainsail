import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { NotificationState } from '@/store/notification/types'

export const mutations: MutationTree<NotificationState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },
}
