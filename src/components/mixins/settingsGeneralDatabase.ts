import Component from 'vue-class-component'
import BaseMixin from './base'

@Component
export default class SettingsGeneralDatabase extends BaseMixin {
    get availableKeys() {
        return [
            {
                value: 'general',
                label: this.$t('Settings.GeneralTab.General'),
            },
            {
                value: 'console',
                label: this.$t('Settings.ConsoleTab.Console'),
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
            {
                value: 'uiSettings',
                label: this.$t('Settings.UiSettingsTab.UiSettings'),
            },
            {
                value: 'view',
                label: this.$t('Settings.GeneralTab.DbView'),
            },
        ]
    }
}
