import { NotificationState } from '@/store/notification/types'
import { Module } from 'vuex'
import { actions } from '@/store/notification/actions'
import { mutations } from '@/store/notification/mutations'
import { getters } from '@/store/notification/getters'

export const getDefaultState = (): NotificationState => {
    return {}
}

// initial state
const state = getDefaultState()

export const notification: Module<NotificationState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
