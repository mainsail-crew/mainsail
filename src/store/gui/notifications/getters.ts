import { GetterTree } from 'vuex'
import { GuiNotificationState, GuiNotificationStateDismissEntry, GuiNotificationStateEntry } from './types'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'
import i18n from '@/plugins/i18n.js'
import { RootStateDependency } from '@/store/types'
import { sha256 } from 'js-sha256'
import { PrinterStateKlipperConfigWarning } from '@/store/printer/types'
import { detect } from 'detect-browser'
import semver from 'semver'
import { minBrowserVersions } from '@/store/variables'

export const getters: GetterTree<GuiNotificationState, any> = {
    getNotifications: (state, getters) => {
        let notifications: GuiNotificationStateEntry[] = []

        // moonraker announcements
        notifications = notifications.concat(getters['getNotificationsAnnouncements'])

        // rpi flag notifications
        notifications = notifications.concat(getters['getNotificationsFlags'])

        // mainsail dependencies
        notifications = notifications.concat(getters['getNotificationsDependencies'])

        // moonraker warnings
        notifications = notifications.concat(getters['getNotificationsMoonrakerWarnings'])

        // moonraker failed components
        notifications = notifications.concat(getters['getNotificationsMoonrakerFailedComponents'])

        // moonraker failed init components
        notifications = notifications.concat(getters['getNotificationsMoonrakerFailedInitComponents'])

        // klipper warnings
        notifications = notifications.concat(getters['getNotificationsKlipperWarnings'])

        // browser warnings
        notifications = notifications.concat(getters['getNotificationsBrowserWarnings'])

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

    getNotificationsAnnouncements: (state, getters, rootState, rootGetters) => {
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

        return notifications
    },

    getNotificationsFlags: (state, getters, rootState, rootGetters) => {
        const notifications: GuiNotificationStateEntry[] = []

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

        return notifications
    },

    getNotificationsDependencies: (state, getters, rootState, rootGetters) => {
        const notifications: GuiNotificationStateEntry[] = []

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

        return notifications
    },

    getNotificationsMoonrakerWarnings: (state, getters, rootState, rootGetters) => {
        const notifications: GuiNotificationStateEntry[] = []

        let warnings = rootState.server.warnings ?? []
        if (warnings.length) {
            const date = rootState.server.system_boot_at ?? new Date()

            // get all dismissed moonraker warnings and convert it to a string[]
            const warningsDismisses = rootGetters['gui/notifications/getDismissByCategory']('moonrakerWarning').map(
                (dismiss: GuiNotificationStateDismissEntry) => {
                    return dismiss.id
                }
            )

            // filter all dismissed warnings
            warnings = warnings.filter((warning: string) => !warningsDismisses.includes(sha256(warning)))

            warnings.forEach((warning: string) => {
                let description = warning

                // add possible translations
                if (warning.startsWith('Unparsed config option')) {
                    const warningRegExp = RegExp(/'(?<option>.+): (?<value>.+)'.+\[(?<section>.+)\]/)
                    const output = warningRegExp.exec(warning)?.groups ?? { option: '', section: '', value: '' }
                    description = i18n.t('App.Notifications.MoonrakerWarnings.UnparsedConfigOption', output).toString()
                } else if (warning.startsWith('Unparsed config section')) {
                    const warningRegExp = RegExp(/\[(?<section>.+)\]/)
                    const output = warningRegExp.exec(warning)?.groups ?? { section: '' }
                    description = i18n.t('App.Notifications.MoonrakerWarnings.UnparsedConfigSection', output).toString()
                }

                notifications.push({
                    id: `moonrakerWarning/${sha256(warning)}`,
                    priority: 'high',
                    title: i18n.t('App.Notifications.MoonrakerWarnings.MoonrakerWarning').toString(),
                    description: description,
                    date,
                    dismissed: false,
                } as GuiNotificationStateEntry)
            })
        }

        return notifications
    },

    getNotificationsMoonrakerFailedComponents: (state, getters, rootState, rootGetters) => {
        const notifications: GuiNotificationStateEntry[] = []

        let failedCompontents = rootState.server.failed_components ?? []
        if (failedCompontents.length) {
            const date = rootState.server.system_boot_at ?? new Date()

            // get all dismissed failed components and convert it to a string[]
            const flagDismisses = rootGetters['gui/notifications/getDismissByCategory']('moonrakerFailedComponent').map(
                (dismiss: GuiNotificationStateDismissEntry) => {
                    return dismiss.id
                }
            )

            // filter all dismissed failed components
            failedCompontents = failedCompontents.filter((component: string) => !flagDismisses.includes(component))

            failedCompontents.forEach((component: string) => {
                notifications.push({
                    id: `moonrakerFailedComponent/${component}`,
                    priority: 'high',
                    title: i18n.t('App.Notifications.MoonrakerWarnings.MoonrakerComponent', { component }).toString(),
                    description: i18n
                        .t('App.Notifications.MoonrakerWarnings.MoonrakerFailedComponentDescription', { component })
                        .toString(),
                    date,
                    dismissed: false,
                } as GuiNotificationStateEntry)
            })
        }

        return notifications
    },

    getNotificationsMoonrakerFailedInitComponents: (state, getters, rootState, rootGetters) => {
        const notifications: GuiNotificationStateEntry[] = []

        let failedInitCompontents = rootState.server.failed_init_components ?? []
        if (failedInitCompontents.length) {
            const date = rootState.server.system_boot_at ?? new Date()

            // get all dismissed failed components and convert it to a string[]
            const flagDismisses = rootGetters['gui/notifications/getDismissByCategory'](
                'moonrakerFailedInitComponent'
            ).map((dismiss: GuiNotificationStateDismissEntry) => {
                return dismiss.id
            })

            // filter all dismissed failed init components
            failedInitCompontents = failedInitCompontents.filter(
                (component: string) => !flagDismisses.includes(component)
            )

            failedInitCompontents.forEach((component: string) => {
                notifications.push({
                    id: `moonrakerFailedInitComponent/${component}`,
                    priority: 'high',
                    title: i18n
                        .t('App.Notifications.MoonrakerWarnings.MoonrakerInitComponent', { component })
                        .toString(),
                    description: i18n
                        .t('App.Notifications.MoonrakerWarnings.MoonrakerFailedInitComponentDescription', { component })
                        .toString(),
                    date,
                    dismissed: false,
                } as GuiNotificationStateEntry)
            })
        }

        return notifications
    },

    getNotificationsKlipperWarnings: (state, getters, rootState, rootGetters) => {
        const notifications: GuiNotificationStateEntry[] = []

        let warnings = (rootState.printer.configfile?.warnings ?? []) as PrinterStateKlipperConfigWarning[]
        if (warnings.length) {
            const date = rootState.server.system_boot_at ?? new Date()

            // get all dismissed klipper warnings and convert it to a string[]
            const warningsDismisses = rootGetters['gui/notifications/getDismissByCategory']('klipperWarning').map(
                (dismiss: GuiNotificationStateDismissEntry) => {
                    return dismiss.id
                }
            )

            // filter all dismissed warnings
            warnings = warnings.filter((warning) => !warningsDismisses.includes(sha256(warning.message)))

            warnings.forEach((warning) => {
                let title = i18n.t('App.Notifications.KlipperWarnings.KlipperWarning').toString()
                let description = warning.message

                // add possible translations
                if (warning.type === 'deprecated_value') {
                    title = i18n.t('App.Notifications.KlipperWarnings.DeprecatedValueHeadline').toString()
                    description = i18n.t('App.Notifications.KlipperWarnings.DeprecatedValue', warning).toString()
                } else if (warning.type === 'deprecated_option') {
                    title = i18n.t('App.Notifications.KlipperWarnings.DeprecatedOptionHeadline').toString()
                    description = i18n.t('App.Notifications.KlipperWarnings.DeprecatedOption', warning).toString()
                } else if (warning.type === 'runtime_warning') {
                    title = i18n.t('App.Notifications.KlipperWarnings.KlipperRuntimeWarning').toString()
                }

                // generate url to mainsail docs to fix this warning
                let url = 'https://docs.mainsail.xyz/faq/klipper_warnings/' + warning.type
                if (warning.type === 'deprecated_option' && warning.option.startsWith('default_parameter'))
                    url += '#default_parameter'
                else if (warning.type === 'deprecated_option') url += '#' + warning.option
                else if (warning.type === 'deprecated_value') url += '#' + warning.value

                notifications.push({
                    id: `klipperWarning/${sha256(warning.message)}`,
                    priority: 'high',
                    title: title,
                    description: description,
                    date,
                    url,
                    dismissed: false,
                } as GuiNotificationStateEntry)
            })
        }

        return notifications
    },

    getNotificationsBrowserWarnings: (state, getters, rootState) => {
        const notifications: GuiNotificationStateEntry[] = []

        const browser = detect()
        const date = rootState.server.system_boot_at ?? new Date()

        // stop here, because no browser detected
        if (browser === null) return notifications

        // output browser information to console
        window.console.debug(`Browser: ${browser.name} ${browser.version}, OS: ${browser.os}`)

        // find browser requirement
        const minBrowserVersion = minBrowserVersions.find(
            (entry) => entry.name.toLowerCase() === browser.name.toLowerCase()
        )

        // stop here, because no browser requirement found
        if (minBrowserVersion === undefined) return notifications

        if (
            semver.valid(browser.version) &&
            semver.valid(minBrowserVersion.version) &&
            semver.gt(minBrowserVersion.version, browser.version ?? '0.0.0')
        ) {
            notifications.push({
                id: `browserWarning/${minBrowserVersion.name}/${minBrowserVersion.version}`,
                priority: 'critical',
                title: i18n.t('App.Notifications.BrowserWarnings.Headline').toString(),
                description: i18n
                    .t('App.Notifications.BrowserWarnings.Description', {
                        name: minBrowserVersion.name,
                        version: browser.version,
                        minVersion: minBrowserVersion.version,
                    })
                    .toString(),
                date,
                dismissed: false,
            } as GuiNotificationStateEntry)
        }

        return notifications
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
