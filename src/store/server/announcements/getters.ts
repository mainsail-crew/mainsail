import { GetterTree } from 'vuex'
import { ServerAnnouncementsState, ServerAnnouncementsStateEntry } from './types'

// eslint-disable-next-line
export const getters: GetterTree<ServerAnnouncementsState, any> = {
    getAll: (state) => {
        return state.entries
            .filter((entry: ServerAnnouncementsStateEntry) => !entry.dismissed)
            .sort((a: ServerAnnouncementsStateEntry, b: ServerAnnouncementsStateEntry) => {
                if (a.priority === 'high' && b.priority !== 'high') return -1
                else if (b.priority === 'high' && a.priority !== 'high') return 1

                return b.date.getTime() - a.date.getTime()
            })
    },
}
