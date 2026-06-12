import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import type { TranslateResult } from 'vue-i18n'
import { useBase } from '@/composables/useBase'

export function useSettingsDatabase() {
    const store = useStore()
    const { t } = useI18n()
    const base = useBase()

    const availableKeys = computed(() => [
        { value: 'general', label: t('Settings.GeneralTab.General') },
        { value: 'control', label: t('Settings.ControlTab.Control') },
        { value: 'dashboard', label: t('Settings.DashboardTab.Dashboard') },
        { value: 'editor', label: t('Settings.EditorTab.Editor') },
        { value: 'gcodeViewer', label: t('Settings.GCodeViewerTab.GCodeViewer') },
        { value: 'navigation', label: t('Settings.GeneralTab.DbNavigation') },
        { value: 'uiSettings', label: t('Settings.UiSettingsTab.UiSettings') },
        { value: 'view', label: t('Settings.GeneralTab.DbView') },
        { value: 'console', label: t('Settings.ConsoleTab.Console') },
        { value: 'gcodehistory', label: t('Settings.GeneralTab.DbConsoleHistory') },
        { value: 'macros', label: t('Settings.MacrosTab.Macros') },
        { value: 'notifications', label: t('App.Notifications.Notifications') },
        { value: 'presets', label: t('Settings.PresetsTab.PreheatPresets') },
        { value: 'remoteprinters', label: t('Settings.RemotePrintersTab.RemotePrinters') },
        { value: 'timelapse', label: t('Settings.TimelapseTab.Timelapse') },
    ])

    async function loadBackupableNamespaces() {
        let backupableNamespaces: { value: string; label: string | TranslateResult }[] = []

        const urlRequestDbList = base.apiUrl.value + '/server/database/list'
        const availableNamespaces = await fetch(urlRequestDbList)
            .then((response) => response?.json())
            .then((response) => response?.result?.namespaces ?? [])
            .catch(() => {
                window.console.error('Cannot load Moonraker DB namespaces')
                return []
            })

        if (availableNamespaces.includes('mainsail')) {
            const urlRequestMainsailNamespace =
                base.apiUrl.value + '/server/database/item?namespace=mainsail'
            backupableNamespaces = await fetch(urlRequestMainsailNamespace)
                .then((response) => response?.json())
                .then((response) => response?.result?.value ?? {})
                .then((objects) => Object.keys(objects))
                .then((keys) => keys.filter((key) => key !== 'initVersion'))
                .then((keys) =>
                    keys.map((key) => {
                        const namespace = availableKeys.value.find(
                            (namespace) => namespace.value === key
                        )
                        if (namespace) return namespace
                        return { value: key, label: key }
                    })
                )

            backupableNamespaces = backupableNamespaces.sort(sortNamespaces)
        }

        if (availableNamespaces.includes('maintenance')) {
            backupableNamespaces.push({
                value: 'maintenance',
                label: t('Settings.GeneralTab.DbMaintenance'),
            })
        }

        if (availableNamespaces.includes('timelapse')) {
            backupableNamespaces.push({
                value: 'timelapse',
                label: t('Settings.GeneralTab.DbTimelapseSettings'),
            })
        }

        if (availableNamespaces.includes('webcams')) {
            backupableNamespaces.push({
                value: 'webcams',
                label: t('Settings.WebcamsTab.Webcams'),
            })
        }

        return backupableNamespaces
    }

    function sortNamespaces(
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

    return {
        ...base,
        availableKeys,
        loadBackupableNamespaces,
        sortNamespaces,
    }
}
