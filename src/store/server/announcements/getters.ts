import { GetterTree } from 'vuex'
import { ServerAnnouncementsState, ServerAnnouncementsStateEntry } from './types'
import { RootState } from '@/store/types'

export const getters: GetterTree<ServerAnnouncementsState, RootState> = {
    getAnnouncements: (state) => {
        return state.entries.filter((entry: ServerAnnouncementsStateEntry) => !entry.dismissed)
    },
}
