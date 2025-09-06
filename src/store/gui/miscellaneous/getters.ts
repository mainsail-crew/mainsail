import { GetterTree } from 'vuex'
import { GuiMiscellaneousState, GuiMiscellaneousStateEntry } from '@/store/gui/miscellaneous/types'

// eslint-disable-next-line
export const getters: GetterTree<GuiMiscellaneousState, any> = {
    getEntries: (state) => {
        const output: GuiMiscellaneousStateEntry[] = []

        Object.entries(state.entries).forEach(([key, values]) => {
            output.push({
                id: key,
                name: values.name,
                type: values.type,
                lightgroups: { ...values.lightgroups },
                presets: { ...values.presets },
            })
        })

        return output
    },

    getEntry: (state, getters) => (payload: { type: string; name: string }) => {
        return getters.getEntries.find(
            (entry: GuiMiscellaneousStateEntry) => entry.name === payload.name && entry.type === payload.type
        ) as GuiMiscellaneousStateEntry
    },

    getId: (state, getters) => (payload: { type: string; name: string }) => {
        return getters.getEntry(payload)?.id ?? null
    },
}
