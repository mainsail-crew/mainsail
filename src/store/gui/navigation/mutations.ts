import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiNavigationState, GuiNavigationStateEntry } from './types'
import Vue from 'vue'
import { NaviPoint } from '@/components/mixins/navigation'

export const mutations: MutationTree<GuiNavigationState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    updatePos(state, payload: GuiNavigationStateEntry) {
        const index = state.entries.findIndex((entry) => {
            return entry.type === payload.type && entry.title === payload.title
        })

        // update existing entry
        if (index !== -1) {
            state.entries[index].position = payload.position
            return
        }

        // create new entry
        const newEntry: GuiNavigationStateEntry = {
            type: payload.type,
            title: payload.title,
            visible: payload.visible,
            position: payload.position,
        }
        // copy old array
        const entries = [...state.entries]
        // add new entry
        entries.push(newEntry)
        // set new array
        Vue.set(state, 'entries', entries)
    },

    changeVisibility(state, payload: NaviPoint) {
        const title = payload.orgTitle ?? payload.title

        const index = state.entries.findIndex((entry) => {
            return entry.type === payload.type && entry.title === title
        })

        // update existing entry
        if (index !== -1) {
            state.entries[index].visible = !payload.visible
            return
        }

        // create new entry
        const newEntry: GuiNavigationStateEntry = {
            type: payload.type,
            title,
            visible: !payload.visible,
            position: payload.position,
        }
        // copy old array
        const entries = [...state.entries]
        // add new entry
        entries.push(newEntry)
        // set new array
        Vue.set(state, 'entries', entries)
    },
}
