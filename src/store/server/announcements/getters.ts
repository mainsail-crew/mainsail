import { GetterTree } from 'vuex'
import { ServerAnnouncementsState, ServerAnnouncementsStateEntry } from './types'

export const getters: GetterTree<ServerAnnouncementsState, any> = {
    getAnnouncements: (state) => {
        return state.entries.filter((entry: ServerAnnouncementsStateEntry) => !entry.dismissed)
    },
}
