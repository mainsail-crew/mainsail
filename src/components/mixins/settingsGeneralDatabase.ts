import Component from 'vue-class-component'
import BaseMixin from './base'

@Component
export default class SettingsGeneralDatabase extends BaseMixin {
    get availableKeys() {
        return [
            {
                name: 'general',
                label: this.$t('Settings.GeneralTab.General'),
            },
            {
                name: 'console',
                label: this.$t('Settings.ConsoleTab.Console'),
            },
            {
                name: 'control',
                label: this.$t('Settings.ControlTab.Control'),
            },
            {
                name: 'dashboard',
                label: this.$t('Settings.DashboardTab.Dashboard'),
            },
            {
                name: 'editor',
                label: this.$t('Settings.EditorTab.Editor'),
            },
            {
                name: 'gcodeViewer',
                label: this.$t('Settings.GCodeViewerTab.GCodeViewer'),
            },
            {
                name: 'gcodehistory',
                label: this.$t('Settings.GeneralTab.DbConsoleHistory'),
            },
            {
                name: 'macros',
                label: this.$t('Settings.MacrosTab.Macros'),
            },
            {
                name: 'notifications',
                label: this.$t('App.Notifications.Notifications'),
            },
            {
                name: 'presets',
                label: this.$t('Settings.PresetsTab.PreheatPresets'),
            },
            {
                name: 'remoteprinters',
                label: this.$t('Settings.RemotePrintersTab.RemotePrinters'),
            },
            {
                name: 'timelapse',
                label: this.$t('Settings.TimelapseTab.Timelapse'),
            },
            {
                name: 'uiSettings',
                label: this.$t('Settings.UiSettingsTab.UiSettings'),
            },
            {
                name: 'view',
                label: this.$t('Settings.GeneralTab.DbView'),
            },
        ]
    }
}
