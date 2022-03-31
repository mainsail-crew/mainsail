import { GetterTree } from 'vuex'
import { NotificationState, NotificationStateEntry } from '@/store/notification/types'
import { ServerAnnouncementsStateEntry } from '../server/announcements/types'
import i18n from '@/plugins/i18n.js'

export const getters: GetterTree<NotificationState, any> = {
    getNotifications: (state, getters, rootState, rootGetters) => {
        const notifications: NotificationStateEntry[] = []

        const announcements = rootGetters['server/announcements/getAnnouncements']
        if (announcements.length) {
            announcements.forEach((entry: ServerAnnouncementsStateEntry) => {
                notifications.push({
                    id: 'announcement/' + entry.entry_id,
                    priority: entry.priority,
                    title: entry.title,
                    description: entry.description,
                    date: entry.date,
                    dismissed: entry.dismissed,
                    url: entry.url,
                } as NotificationStateEntry)
            })
        }

        const flags = rootGetters['server/getThrottledStateFlags']
        if (flags.length) {
            const date = rootState.server.system_boot_at ?? new Date()

            flags.forEach((flag: string) => {
                notifications.push({
                    id: 'flag/' + flag,
                    priority: flag.startsWith('Previously') ? 'high' : 'critical',
                    title: i18n.t(`App.ThrottledStates.Title${flag}`),
                    description: i18n.t(`App.ThrottledStates.Description${flag}`),
                    date,
                    dismissed: false,
                } as NotificationStateEntry)
            })
        }

        const mapType = {
            normal: 2,
            high: 1,
            critical: 0,
        }

        window.console.log('new notifications')

        return notifications.sort((a, b) => {
            if (mapType[a.priority] < mapType[b.priority]) return -1
            if (mapType[a.priority] > mapType[b.priority]) return 1

            return b.date.getTime() - a.date.getTime()
        })
    },
}
