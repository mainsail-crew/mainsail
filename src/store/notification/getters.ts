import { GetterTree } from 'vuex'
import { NotificationState, NotificationStateEntry } from '@/store/notification/types'
import { ServerAnnouncementsStateEntry } from '../server/announcements/types'

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

        const mapType = {
            normal: 2,
            high: 1,
            critical: 0,
        }

        return notifications.sort((a, b) => {
            if (mapType[a.priority] < mapType[b.priority]) return -1
            if (mapType[a.priority] > mapType[b.priority]) return 1

            return b.date.getTime() - a.date.getTime()
        })
    },
}
