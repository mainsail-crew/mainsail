import Vue from 'vue'
import { MutationTree } from 'vuex'
import { GuiRemindersState } from '@/store/gui/reminders/types'
import { getDefaultState } from './index'

export const mutations: MutationTree<GuiRemindersState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        Vue.set(state, 'reminders', payload.value)
    },

    store(state, payload) {
        Vue.set(state.reminders, payload.id, payload.values)
    },

    update(state, payload) {
        if (payload.id in state.reminders) {
            const reminder = { ...state.reminders[payload.id] }
            Object.assign(reminder, payload)
            Vue.set(state.reminders, payload.id, reminder)
        }
    },

    delete(state, payload) {
        if (payload in state.reminders) {
            Vue.delete(state.reminders, payload)
        }
    },
}
