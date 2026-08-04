import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { GuiNavigationState, GuiNavigationStateEntry } from './types'
import Vue from 'vue'

export const mutations: MutationTree<GuiNavigationState> = {
    reset(state): void {
        Object.assign(state, getDefaultState())
    },

    update(
        state,
        payload: { parameter: 'position' | 'toggleVisibility'; entry: GuiNavigationStateEntry & { orgTitle?: string } }
    ): void {
        const entries = [...state.entries]
        const title = payload.entry.orgTitle ?? payload.entry.title

        let indexEntry = entries.findIndex((entry) => {
            return entry.type === payload.entry.type && entry.title === title
        })

        if (indexEntry === -1) {
            const newEntry: GuiNavigationStateEntry = {
                type: payload.entry.type,
                title,
                visible: payload.entry.visible,
                position: payload.entry.position,
            }
            entries.push(newEntry)
            indexEntry = entries.length - 1
        }

        switch (payload.parameter) {
            case 'toggleVisibility':
                entries[indexEntry].visible = !entries[indexEntry].visible
                break

            case 'position':
                entries[indexEntry].position = payload.entry.position
                break
        }

        Vue.set(state, 'entries', entries)
    },
}
