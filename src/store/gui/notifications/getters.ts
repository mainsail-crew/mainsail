import { GetterTree } from 'vuex'
import {
    GuiNotificationCategory,
    GuiNotificationState,
    GuiNotificationStateDismissEntry,
    GuiNotificationStateEntry,
} from './types'
import { ServerAnnouncementsStateEntry } from '@/store/server/announcements/types'
import i18n from '@/plugins/i18n.js'
import { RootState, RootStateDependency } from '@/store/types'
import { sha256 } from 'js-sha256'
import { PrinterStateKlipperConfigWarning } from '@/store/printer/types'
import { detect } from 'detect-browser'
import semver from 'semver'
import { minBrowserVersions } from '@/store/variables'
import { GuiMaintenanceStateEntry } from '@/store/gui/maintenance/types'

export const getters: GetterTree<GuiNotificationState, RootState> = {
    getNotifications: (_state, getters) => {
        const notifications: GuiNotificationStateEntry[] = [
            // moonraker announcements
            ...getters['getNotificationsAnnouncements'],

            // rpi flag notifications
            ...getters['getNotificationsFlags'],

            // mainsail dependencies
            ...getters['getNotificationsDependencies'],

            // moonraker warnings
            ...getters['getNotificationsMoonrakerWarnings'],

            // moonraker failed components
            ...getters['getNotificationsMoonrakerFailedComponents'],

            // moonraker failed init components
            ...getters['getNotificationsMoonrakerFailedInitComponents'],

            // klipper warnings
            ...getters['getNotificationsKlipperWarnings'],

            // user-created reminders
            ...getters['getNotificationsOverdueMaintenance'],

            // browser warnings
            ...getters['getNotificationsBrowserWarnings'],

            // TMC overheat warnings
            ...getters['getNotificationsOverheatDrivers'],
        ]

        const mapType = {
            normal: 2,
            high: 1,
            critical: 0,
        } as const

        return notifications.sort((a, b) => {
            if (mapType[a.priority] < mapType[b.priority]) return -1
            if (mapType[a.priority] > mapType[b.priority]) return 1

            return b.date.getTime() - a.date.getTime()
        })
    },

    getNotificationsAnnouncements: (_state, _getters, _rootState, rootGetters) => {
        // moonraker announcements
        const announcements = rootGetters['server/announcements/getAnnouncements'] as ServerAnnouncementsStateEntry[]
        if (announcements.length === 0) return []

        const notifications: GuiNotificationStateEntry[] = []
        announcements.forEach((entry) => {
            notifications.push({
                id: 'announcement/' + entry.entry_id,
                priority: entry.priority,
                title: entry.title,
                description: entry.description,
                date: entry.date,
                dismissed: entry.dismissed,
                url: entry.url,
            })
        })

        return notifications
    },

    getNotificationsFlags: (_state, getters, rootState, rootGetters) => {
        // get all current flags
        let flags = rootGetters['server/getThrottledStateFlags'] as string[]
        if (flags.length === 0) return []

        const date = rootState.server?.system_boot_at ?? new Date()

        // get all dismissed flags and convert it to a string[]
        const flagDismisses = getters['getDismissByCategory']('flag').map(
            (dismiss: GuiNotificationStateDismissEntry) => {
                return dismiss.id
            }
        )

        // filter all dismissed flags
        flags = flags.filter((flag: string) => !flagDismisses.includes(flag))

        const notifications: GuiNotificationStateEntry[] = []

        // add all flags to the notifications array
        flags.forEach((flag: string) => {
            notifications.push({
                id: 'flag/' + flag,
                priority: flag.startsWith('Previously') ? 'high' : 'critical',
                title: i18n.t(`App.ThrottledStates.Title${flag}`).toString(),
                description: i18n.t(`App.ThrottledStates.Description${flag}`).toString(),
                date,
                dismissed: false,
            })
        })

        return notifications
    },

    getNotificationsDependencies: (_state, getters, rootState, rootGetters) => {
        let dependencies = rootGetters['getDependencies'] as RootStateDependency[]
        if (dependencies.length === 0) return []

        const date = rootState.server?.system_boot_at ?? new Date()

        // get all dismissed dependencies and convert it to a string[]
        const flagDismisses = getters['getDismissByCategory']('dependency').map(
            (dismiss: GuiNotificationStateDismissEntry) => {
                return dismiss.id
            }
        )

        // filter all dismissed dependencies
        dependencies = dependencies.filter(
            (dependency) => !flagDismisses.includes(`${dependency.serviceName}/${dependency.neededVersion}`)
        )

        const notifications: GuiNotificationStateEntry[] = []
        dependencies.forEach((dependency) => {
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
            })
        })

        return notifications
    },

    getNotificationsMoonrakerWarnings: (_state, getters, rootState) => {
        let warnings = rootState.server?.warnings ?? []
        if (warnings.length === 0) return []

        const date = rootState.server?.system_boot_at ?? new Date()

        // get all dismissed moonraker warnings and convert it to a string[]
        const warningsDismisses = getters['getDismissByCategory']('moonrakerWarning').map(
            (dismiss: GuiNotificationStateDismissEntry) => {
                return dismiss.id
            }
        )

        // filter all dismissed warnings
        warnings = warnings.filter((warning: string) => !warningsDismisses.includes(sha256(warning)))

        const notifications: GuiNotificationStateEntry[] = []
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
            })
        })

        return notifications
    },

    getNotificationsMoonrakerFailedComponents: (_state, getters, rootState) => {
        let failedComponents = rootState.server?.failed_components ?? []
        if (failedComponents.length === 0) return []

        const date = rootState.server?.system_boot_at ?? new Date()

        // get all dismissed failed components and convert it to a string[]
        const flagDismisses = getters['getDismissByCategory']('moonrakerFailedComponent').map(
            (dismiss: GuiNotificationStateDismissEntry) => {
                return dismiss.id
            }
        )

        // filter all dismissed failed components
        failedComponents = failedComponents.filter((component: string) => !flagDismisses.includes(component))

        const notifications: GuiNotificationStateEntry[] = []
        failedComponents.forEach((component: string) => {
            notifications.push({
                id: `moonrakerFailedComponent/${component}`,
                priority: 'high',
                title: i18n.t('App.Notifications.MoonrakerWarnings.MoonrakerComponent', { component }).toString(),
                description: i18n
                    .t('App.Notifications.MoonrakerWarnings.MoonrakerFailedComponentDescription', { component })
                    .toString(),
                date,
                dismissed: false,
            })
        })

        return notifications
    },

    getNotificationsMoonrakerFailedInitComponents: (_state, getters, rootState) => {
        let failedInitCompontents = rootState.server?.failed_init_components ?? []
        if (failedInitCompontents.length === 0) return []

        const date = rootState.server?.system_boot_at ?? new Date()

        // get all dismissed failed components and convert it to a string[]
        const flagDismisses = getters['getDismissByCategory']('moonrakerFailedInitComponent').map(
            (dismiss: GuiNotificationStateDismissEntry) => {
                return dismiss.id
            }
        )

        // filter all dismissed failed init components
        failedInitCompontents = failedInitCompontents.filter((component: string) => !flagDismisses.includes(component))

        const notifications: GuiNotificationStateEntry[] = []
        failedInitCompontents.forEach((component: string) => {
            notifications.push({
                id: `moonrakerFailedInitComponent/${component}`,
                priority: 'high',
                title: i18n.t('App.Notifications.MoonrakerWarnings.MoonrakerInitComponent', { component }).toString(),
                description: i18n
                    .t('App.Notifications.MoonrakerWarnings.MoonrakerFailedInitComponentDescription', { component })
                    .toString(),
                date,
                dismissed: false,
            })
        })

        return notifications
    },

    getNotificationsKlipperWarnings: (_state, getters, rootState) => {
        let warnings = (rootState.printer?.configfile?.warnings ?? []) as PrinterStateKlipperConfigWarning[]
        if (warnings.length === 0) return []

        const date = rootState.server?.system_boot_at ?? new Date()

        // get all dismissed klipper warnings and convert it to a string[]
        const warningsDismisses = getters['getDismissByCategory']('klipperWarning').map(
            (dismiss: GuiNotificationStateDismissEntry) => {
                return dismiss.id
            }
        )

        // filter all dismissed warnings
        warnings = warnings.filter((warning) => !warningsDismisses.includes(sha256(warning.message)))

        const notifications: GuiNotificationStateEntry[] = []
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
            let url = `https://docs.mainsail.xyz/faq/klipper_warnings/${warning.type}`
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
            })
        })

        return notifications
    },

    getNotificationsBrowserWarnings: (_state, _getters, rootState) => {
        const browser = detect()
        const date = rootState.server?.system_boot_at ?? new Date()

        // stop here, because no browser detected
        if (browser === null) return []

        // output browser information to console
        window.console.debug(`Browser: ${browser.name} ${browser.version}, OS: ${browser.os}`)

        // find browser requirement
        const minBrowserVersion = minBrowserVersions.find(
            (entry) => entry.name.toLowerCase() === browser.name.toLowerCase()
        )

        // stop here, because no browser requirement found
        if (minBrowserVersion === undefined) return []

        const notifications: GuiNotificationStateEntry[] = []
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
            })
        }

        return notifications
    },

    getNotificationsOverdueMaintenance: (_state, getters, rootState, rootGetters) => {
        let entries: GuiMaintenanceStateEntry[] = rootGetters['gui/maintenance/getOverdueEntries']
        if (entries.length === 0) return []

        const date = rootState.server?.system_boot_at ?? new Date()

        // get all dismissed reminders and convert it to a string[]
        const remindersDismisses = getters['getDismissByCategory']('maintenance').map(
            (dismiss: GuiNotificationStateDismissEntry) => {
                return dismiss.id
            }
        )

        // filter all dismissed reminders
        entries = entries.filter((entry) => !remindersDismisses.includes(entry.id))

        const notifications: GuiNotificationStateEntry[] = []
        entries.forEach((entry) => {
            notifications.push({
                id: `maintenance/${entry.id}`,
                priority: 'high',
                title: i18n.t('App.Notifications.MaintenanceReminder').toString(),
                description: i18n.t('App.Notifications.MaintenanceReminderText', { name: entry.name }).toString(),
                date,
                dismissed: false,
            })
        })

        return notifications
    },

    getNotificationsOverheatDrivers: (_state, getters, rootState) => {
        const notifications: GuiNotificationStateEntry[] = []
        const date = rootState.server?.system_boot_at ?? new Date()

        Object.keys(rootState.printer ?? {})
            .filter((key) => key.startsWith('tmc'))
            .forEach((key) => {
                const printerObject = rootState.printer?.[key]
                const name = key.split(' ')[1]

                if ((printerObject.drv_status?.ot ?? null) === 1) {
                    notifications.push({
                        id: `tmcwarning/${key}-ot`,
                        priority: 'critical',
                        title: i18n.t('App.Notifications.TmcOtFlag').toString(),
                        description: i18n.t('App.Notifications.TmcOtFlagText', { name }).toString(),
                        date,
                        dismissed: false,
                        url: 'https://www.klipper3d.org/TMC_Drivers.html#tmc-reports-error-ot1overtemperror',
                    })
                }

                if ((printerObject.drv_status?.otpw ?? null) === 1) {
                    notifications.push({
                        id: `tmcwarning/${key}-otpw`,
                        priority: 'high',
                        title: i18n.t('App.Notifications.TmcOtpwFlag').toString(),
                        description: i18n.t('App.Notifications.TmcOtpwFlagText', { name }).toString(),
                        date,
                        dismissed: false,
                        url: 'https://www.klipper3d.org/TMC_Drivers.html#tmc-reports-error-ot1overtemperror',
                    })
                }
            })

        // get all dismissed tmcwarnings and convert it to a string[]
        const tmcwarningsDismisses = getters['getDismissByCategory']('tmcwarning').map(
            (dismiss: GuiNotificationStateDismissEntry) => {
                return `tmcwarning/${dismiss.id}`
            }
        )

        // return filtered tmcwarnings
        return notifications.filter((entry) => {
            return !tmcwarningsDismisses.includes(entry.id)
        })
    },

    getDismiss: (state, _getters, rootState) => {
        const currentTime = new Date()
        const systemBootAt = rootState.server?.system_boot_at ?? new Date()
        let dismisses = [...state.dismiss]
        dismisses = dismisses.filter((dismiss) => {
            if (dismiss.type === 'reboot') return systemBootAt.getTime() < dismiss.date
            if (dismiss.type === 'time') return currentTime.getTime() < dismiss.date

            return true
        })

        return dismisses
    },

    getDismissByCategory: (_state, getters) => (category: GuiNotificationCategory) => {
        return getters.getDismiss.filter((dismiss: GuiNotificationStateDismissEntry) => dismiss.category === category)
    },
}
