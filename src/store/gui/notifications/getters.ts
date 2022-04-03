import { GetterTree } from 'vuex'
import { GuiNotificationState, GuiNotificationStateDismissEntry, GuiNotificationStateEntry } from './types'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'
import i18n from '@/plugins/i18n.js'
import { RootStateDependency } from '@/store/types'

export const getters: GetterTree<GuiNotificationState, any> = {
    getNotifications: (state, getters, rootState, rootGetters) => {
        const notifications: GuiNotificationStateEntry[] = []

        // moonraker announcements
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
                } as GuiNotificationStateEntry)
            })
        }

        // rpi flag notifications
        // get all current flags
        let flags = rootGetters['server/getThrottledStateFlags']
        if (flags.length) {
            const date = rootState.server.system_boot_at ?? new Date()

            // get all dismissed flags and convert it to a string[]
            const flagDismisses = rootGetters['gui/notifications/getDismissByCategory']('flag').map(
                (dismiss: GuiNotificationStateDismissEntry) => {
                    return dismiss.id
                }
            )

            // filter all dismissed flags
            flags = flags.filter((flag: string) => !flagDismisses.includes(flag))

            // add all flags to the notifications array
            flags.forEach((flag: string) => {
                notifications.push({
                    id: 'flag/' + flag,
                    priority: flag.startsWith('Previously') ? 'high' : 'critical',
                    title: i18n.t(`App.ThrottledStates.Title${flag}`),
                    description: i18n.t(`App.ThrottledStates.Description${flag}`),
                    date,
                    dismissed: false,
                } as GuiNotificationStateEntry)
            })
        }

        // mainsail dependencies
        let dependencies = rootGetters['getDependencies']
        if (dependencies.length) {
            const date = rootState.server.system_boot_at ?? new Date()

            // get all dismissed dependencies and convert it to a string[]
            const flagDismisses = rootGetters['gui/notifications/getDismissByCategory']('dependency').map(
                (dismiss: GuiNotificationStateDismissEntry) => {
                    return dismiss.id
                }
            )

            // filter all dismissed dependencies
            dependencies = dependencies.filter(
                (dependency: RootStateDependency) =>
                    !flagDismisses.includes(`${dependency.serviceName}/${dependency.neededVersion}`)
            )

            dependencies.forEach((dependency: RootStateDependency) => {
                notifications.push({
                    id: `dependency/${dependency.serviceName}/${dependency.neededVersion}`,
                    priority: 'high',
                    title: i18n.t('App.Notifications.DependencyName', { name: dependency.serviceName }).toString(),
                    description: i18n
                        .t('App.Notifications.DependencyDescription', {
                            name: dependency.serviceName,
                            installedVersion: dependency.installedVersion,
                            neededVersion: dependency.neededVersion,
                        })
                        .toString(),
                    date,
                    dismissed: false,
                } as GuiNotificationStateEntry)
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

    getDismiss: (state, getters, rootState) => {
        const currentTime = new Date()
        const systemBootAt = rootState.server.system_boot_at ?? new Date()
        let dismisses = [...state.dismiss]
        dismisses = dismisses.filter((dismiss) => {
            if (dismiss.type === 'reboot') {
                return systemBootAt.getTime() < dismiss.date
            }

            if (dismiss.type === 'time') {
                return currentTime.getTime() < dismiss.date
            }

            return true
        })

        return dismisses
    },

    getDismissByCategory: (state, getters) => (category: string) => {
        let dismisses = getters.getDismiss
        dismisses = dismisses.filter((dismiss: GuiNotificationStateDismissEntry) => dismiss.category === category)

        return dismisses
    },
}
