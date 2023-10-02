import Component from 'vue-class-component'
import BaseMixin from './base'
import { TranslateResult } from 'vue-i18n'

@Component
export default class SettingsGeneralDatabase extends BaseMixin {
    get availableKeys() {
        return [
            // gui namespace
            {
                value: 'general',
                label: this.$t('Settings.GeneralTab.General'),
            },
            {
                value: 'control',
                label: this.$t('Settings.ControlTab.Control'),
            },
            {
                value: 'dashboard',
                label: this.$t('Settings.DashboardTab.Dashboard'),
            },
            {
                value: 'editor',
                label: this.$t('Settings.EditorTab.Editor'),
            },
            {
                value: 'gcodeViewer',
                label: this.$t('Settings.GCodeViewerTab.GCodeViewer'),
            },
            {
                value: 'navigation',
                label: this.$t('Settings.GeneralTab.DBNavigation'),
            },
            {
                value: 'uiSettings',
                label: this.$t('Settings.UiSettingsTab.UiSettings'),
            },
            {
                value: 'view',
                label: this.$t('Settings.GeneralTab.DbView'),
            },

            // gui modules
            {
                value: 'console',
                label: this.$t('Settings.ConsoleTab.Console'),
            },
            {
                value: 'gcodehistory',
                label: this.$t('Settings.GeneralTab.DbConsoleHistory'),
            },
            {
                value: 'macros',
                label: this.$t('Settings.MacrosTab.Macros'),
            },
            {
                value: 'notifications',
                label: this.$t('App.Notifications.Notifications'),
            },
            {
                value: 'presets',
                label: this.$t('Settings.PresetsTab.PreheatPresets'),
            },
            {
                value: 'remoteprinters',
                label: this.$t('Settings.RemotePrintersTab.RemotePrinters'),
            },
            {
                value: 'timelapse',
                label: this.$t('Settings.TimelapseTab.Timelapse'),
            },
        ]
    }

    async loadBackupableNamespaces() {
        // init namespaces
        let backupableNamespaces: { value: string; label: string | TranslateResult }[] = []

        // load DB namespaces from moonraker
        const urlRequestDbList = this.$store.getters['socket/getUrl'] + '/server/database/list'
        const availableNamespaces = await fetch(urlRequestDbList)
            // read json
            .then((response) => response?.json())
            // extract result namespaces
            .then((response) => response?.result?.namespaces ?? [])
            .catch(() => {
                window.console.error('Cannot load Moonraker DB namespaces')
                return []
            })

        // load mainsail keys, if mainsail namespace exists
        if (availableNamespaces.includes('mainsail')) {
            const urlRequestMainsailNamespace =
                this.$store.getters['socket/getUrl'] + '/server/database/item?namespace=mainsail'
            backupableNamespaces = await fetch(urlRequestMainsailNamespace)
                // read json
                .then((response) => response?.json())
                // extract result object
                .then((response) => response?.result?.value ?? {})
                // extract keys from mainsail gui object
                .then((objects) => Object.keys(objects))
                // filter initVersion
                .then((keys) => keys.filter((key) => key !== 'initVersion'))
                // convert to locale
                .then((keys) =>
                    keys.map((key) => {
                        const namespace = this.availableKeys.find((namespace) => namespace.value === key)
                        if (namespace) return namespace

                        // fallback return key name
                        return { value: key, label: key }
                    })
                )

            backupableNamespaces = backupableNamespaces.sort(this.sortNamespaces)
        }

        // add timelapse if exists
        if (availableNamespaces.includes('timelapse')) {
            backupableNamespaces.push({
                value: 'timelapse',
                label: this.$t('Settings.GeneralTab.DbTimelapseSettings'),
            })
        }

        // add webcams if exists
        if (availableNamespaces.includes('webcams')) {
            backupableNamespaces.push({
                value: 'webcams',
                label: this.$t('Settings.WebcamsTab.Webcams'),
            })
        }

        return backupableNamespaces
    }

    sortNamespaces(
        a: { value: string; label: string | TranslateResult },
        b: { value: string; label: string | TranslateResult }
    ) {
        if (a.value === 'general') return -1
        if (b.value === 'general') return 1

        const stringA = a.label.toString().toLowerCase()
        const stringB = b.label.toString().toLowerCase()

        if (stringA < stringB) return -1
        if (stringA > stringB) return 1

        return 0
    }
}
