import { Module } from 'vuex'
import { ServerAnnouncementsState } from '@/store/server/announcements/types'
import { actions } from '@/store/server/announcements/actions'
import { mutations } from '@/store/server/announcements/mutations'
import { getters } from '@/store/server/announcements/getters'

export const getDefaultState = (): ServerAnnouncementsState => {
    return {
        entries: [],
        feeds: [],
    }
}

// initial state
const state = getDefaultState()

// eslint-disable-next-line
export const announcements: Module<ServerAnnouncementsState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
