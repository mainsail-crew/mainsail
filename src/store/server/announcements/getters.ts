import { GetterTree } from 'vuex'
import { ServerAnnouncementsState, ServerAnnouncementsStateEntry } from './types'

// eslint-disable-next-line
export const getters: GetterTree<ServerAnnouncementsState, any> = {
    getFirstCritical: (state) => {
        const entries = state.entries
            .filter((entry: ServerAnnouncementsStateEntry) => entry.priority === 'high' && !entry.dismissed)
            .sort(
                (a: ServerAnnouncementsStateEntry, b: ServerAnnouncementsStateEntry) =>
                    b.date.getTime() - a.date.getTime()
            )

        return entries.length > 0 ? entries.shift() : null
    },

    getNormal: (state) => {
        return state.entries
            .filter((entry: ServerAnnouncementsStateEntry) => entry.priority === 'normal' && !entry.dismissed)
            .sort(
                (a: ServerAnnouncementsStateEntry, b: ServerAnnouncementsStateEntry) =>
                    b.date.getTime() - a.date.getTime()
            )
    },
}
