import { GetterTree } from 'vuex'
import {
    GuiMiscellaneousState,
    GuiMiscellaneousStateEntry,
    GuiMiscellaneousStateEntryLightgroup,
} from '@/store/gui/miscellaneous/types'
import { caseInsensitiveSort } from '@/plugins/helpers'

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
            })
        })

        window.console.log('getEntries', output)

        return output
    },

    getEntry: (state, getters) => (payload: { type: string; name: string }) => {
        window.console.log('getEntry', payload)

        return getters.getEntries.find(
            (entry: GuiMiscellaneousStateEntry) => entry.name === payload.name && entry.type === payload.type
        ) as GuiMiscellaneousStateEntry
    },

    getId: (state, getters) => (payload: { type: string; name: string }) => {
        window.console.log('getId', payload)
        return getters.getEntry(payload)?.id ?? null
    },

    getEntryLightgroups: (state, getters) => (payload: { type: string; name: string }) => {
        const entry = getters.getEntry(payload) as GuiMiscellaneousStateEntry | null

        if (!entry) return []

        const groups: GuiMiscellaneousStateEntryLightgroup[] = []
        Object.entries(entry.lightgroups).forEach(([key, lightgroup]) => {
            groups.push({
                name: lightgroup.name,
                start: lightgroup.start,
                end: lightgroup.end,
                id: key,
            })
        })
        window.console.log('getEntryLightgroups', groups)

        return caseInsensitiveSort(groups, 'name')
    },
}
