import { GetterTree } from 'vuex'
import { ServerAnnouncementsState, ServerAnnouncementsStateEntry } from './types'
import { RootState } from '@/store/types'

export const getters: GetterTree<ServerAnnouncementsState, RootState> = {
    activeAnnouncements: (state): ServerAnnouncementsStateEntry[] => {
        return state.entries.filter((entry) => !entry.dismissed)
    },
}
