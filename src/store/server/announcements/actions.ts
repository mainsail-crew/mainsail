import Vue from 'vue'
import { ActionTree } from 'vuex'
import { RootState } from '@/store/types'
import { ServerAnnouncementsState, ServerAnnouncementsStateEntry } from './types'
import type {
    AnnouncementDismissedNotification,
    AnnouncementEntry,
    AnnouncementUpdateNotification,
    AnnouncementWakeNotification,
} from '@/types/moonraker/AnnouncementsRPC'

const LOG_PREFIX = '[Server][Announcements]'
const logDebug = (...args: unknown[]) => window.console.debug(LOG_PREFIX, ...args)
const logError = (...args: unknown[]) => window.console.error(LOG_PREFIX, ...args)

const timestampToDate = (timestamp: number | null): Date | null => (timestamp ? new Date(timestamp * 1000) : null)

const convertEntry = (entry: AnnouncementEntry): ServerAnnouncementsStateEntry => ({
    ...entry,
    date: new Date(entry.date * 1000),
    date_dismissed: timestampToDate(entry.date_dismissed),
    dismiss_wake: timestampToDate(entry.dismiss_wake),
})

export const actions: ActionTree<ServerAnnouncementsState, RootState> = {
    reset({ commit }): void {
        commit('reset')
    },

    async init({ commit }): Promise<void> {
        logDebug('init')

        try {
            const response = await Vue.$socket.emitAndWait('server.announcements.list')

            commit('setEntries', response.entries.map(convertEntry))
            commit('setFeeds', response.feeds)
        } catch (error) {
            logError('Failed to initialize announcements:', error)
        }
    },

    notifyAnnouncementUpdate({ commit }, payload: AnnouncementUpdateNotification): void {
        commit('setEntries', payload.entries.map(convertEntry))
    },

    notifyAnnouncementDismissed({ commit }, payload: AnnouncementDismissedNotification): void {
        commit('setDismissed', { entry_id: payload.entry_id, dismissed: true })
    },

    notifyAnnouncementWake({ commit }, payload: AnnouncementWakeNotification): void {
        commit('setDismissed', { entry_id: payload.entry_id, dismissed: false })
    },

    /**
     * Dismiss an announcement. Without a wake_time the announcement stays dismissed indefinitely.
     * The state is updated via the notify_announcement_dismissed notification.
     */
    async dismiss(_, payload: { entry_id: string; wake_time?: number | null }): Promise<void> {
        const { entry_id, wake_time } = payload

        // Moonraker rejects an explicit null, so wake_time has to be omitted to dismiss indefinitely
        const params = wake_time == null ? { entry_id } : { entry_id, wake_time }

        await Vue.$socket.emitAndWait('server.announcements.dismiss', params)
    },
}
