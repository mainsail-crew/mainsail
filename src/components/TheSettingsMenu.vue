<template>
    <div>
        <v-btn icon tile @click="showSettings = true">
            <v-icon>{{ mdiCogs }}</v-icon>
        </v-btn>
        <v-dialog
            v-model="showSettings"
            width="900"
            persistent
            :fullscreen="isMobile"
            scrollable
            @keydown.esc="showSettings = false">
            <panel
                :title="$t('Settings.InterfaceSettings')"
                :icon="mdiCogs"
                card-class="settings-menu-dialog"
                :margin-bottom="false"
                style="overflow: hidden"
                :height="isMobile ? 0 : 548">
                <template #buttons>
                    <v-btn icon tile @click="showSettings = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <template v-if="isMobile">
                    <v-tabs v-model="activeTab" :center-active="true" :show-arrows="true">
                        <v-tab
                            v-for="(tab, index) of tabTitles"
                            :key="index"
                            :href="'#' + tab.name"
                            class="justify-start">
                            <v-icon left v-html="tab.icon"></v-icon>
                            {{ tab.title }}
                        </v-tab>
                    </v-tabs>
                </template>
                <v-row class="flex-row flex-nowrap">
                    <v-col v-if="!isMobile" class="col-auto pr-0">
                        <overlay-scrollbars ref="settingsTabsScroll" class="settings-tabs-bar height500">
                            <v-tabs v-model="activeTab" :vertical="true">
                                <v-tab
                                    v-for="(tab, index) of tabTitles"
                                    :key="index"
                                    :href="'#' + tab.name"
                                    class="justify-start"
                                    style="width: 200px">
                                    <v-icon left v-html="tab.icon"></v-icon>
                                    <span class="text-truncate">{{ tab.title }}</span>
                                </v-tab>
                            </v-tabs>
                        </overlay-scrollbars>
                    </v-col>
                    <v-col :class="isMobile ? '' : 'pl-0'" :style="isMobile ? '' : 'min-width: 500px;'">
                        <overlay-scrollbars
                            ref="settingsScroll"
                            :class="'settings-tabs ' + (isMobile ? '' : 'height500')"
                            :options="{ overflowBehavior: { x: 'hidden' } }">
                            <component
                                :is="'settings-' + activeTab + '-tab'"
                                @scrollToTop="scrollToTop"
                                v-if="showSettings"></component>
                        </overlay-scrollbars>
                    </v-col>
                </v-row>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsGeneralTab from '@/components/settings/SettingsGeneralTab.vue'
import SettingsWebcamsTab from '@/components/settings/SettingsWebcamsTab.vue'
import SettingsMacrosTab from '@/components/settings/SettingsMacrosTab.vue'
import SettingsControlTab from '@/components/settings/SettingsControlTab.vue'
import SettingsConsoleTab from '@/components/settings/SettingsConsoleTab.vue'
import SettingsPresetsTab from '@/components/settings/SettingsPresetsTab.vue'
import SettingsRemotePrintersTab from '@/components/settings/SettingsRemotePrintersTab.vue'
import SettingsUiSettingsTab from '@/components/settings/SettingsUiSettingsTab.vue'
import SettingsDashboardTab from '@/components/settings/SettingsDashboardTab.vue'
import SettingsGCodeViewerTab from '@/components/settings/SettingsGCodeViewerTab.vue'
import SettingsEditorTab from '@/components/settings/SettingsEditorTab.vue'
import SettingsTimelapseTab from '@/components/settings/SettingsTimelapseTab.vue'

import Panel from '@/components/ui/Panel.vue'
import {
    mdiCloseThick,
    mdiCodeTags,
    mdiCog,
    mdiCogs,
    mdiConsoleLine,
    mdiFileDocumentEditOutline,
    mdiFire,
    mdiMonitorDashboard,
    mdiPalette,
    mdiPrinter3d,
    mdiTimelapse,
    mdiTune,
    mdiVideo3d,
    mdiWebcam,
    mdiDipSwitch,
} from '@mdi/js'
import SettingsMiscellaneousTab from '@/components/settings/SettingsMiscellaneousTab.vue'
@Component({
    components: {
        Panel,
        SettingsUiSettingsTab,
        SettingsRemotePrintersTab,
        SettingsPresetsTab,
        SettingsConsoleTab,
        SettingsControlTab,
        SettingsMacrosTab,
        SettingsWebcamsTab,
        SettingsGeneralTab,
        SettingsDashboardTab,
        SettingsGCodeViewerTab,
        SettingsEditorTab,
        SettingsTimelapseTab,
        SettingsMiscellaneousTab,
    },
})
export default class TheSettingsMenu extends Mixins(BaseMixin) {
    private showSettings = false
    private activeTab = 'general'

    /**
     * Icons
     */
    mdiCloseThick = mdiCloseThick
    mdiCogs = mdiCogs

    declare $refs: {
        settingsScroll: any
    }

    get tabTitles() {
        const tabs = [
            {
                icon: mdiCog,
                name: 'general',
                title: this.$t('Settings.GeneralTab.General'),
            },
            {
                icon: mdiPalette,
                name: 'ui-settings',
                title: this.$t('Settings.UiSettingsTab.UiSettings'),
            },
            {
                icon: mdiMonitorDashboard,
                name: 'dashboard',
                title: this.$t('Settings.DashboardTab.Dashboard'),
            },
            {
                icon: mdiWebcam,
                name: 'webcams',
                title: this.$t('Settings.WebcamsTab.Webcams'),
            },
            {
                icon: mdiCodeTags,
                name: 'macros',
                title: this.$t('Settings.MacrosTab.Macros'),
            },
            {
                icon: mdiTune,
                name: 'control',
                title: this.$t('Settings.ControlTab.Control'),
            },
            {
                icon: mdiConsoleLine,
                name: 'console',
                title: this.$t('Settings.ConsoleTab.Console'),
            },
            {
                icon: mdiFire,
                name: 'presets',
                title: this.$t('Settings.PresetsTab.PreheatPresets'),
            },
            {
                icon: mdiPrinter3d,
                name: 'remote-printers',
                title: this.$t('Settings.RemotePrintersTab.RemotePrinters'),
            },
            {
                icon: mdiVideo3d,
                name: 'g-code-viewer',
                title: this.$t('Settings.GCodeViewerTab.GCodeViewer'),
            },
            {
                icon: mdiFileDocumentEditOutline,
                name: 'editor',
                title: this.$t('Settings.EditorTab.Editor'),
            },
            {
                icon: mdiDipSwitch,
                name: 'miscellaneous',
                title: this.$t('Settings.MiscellaneousTab.Miscellaneous'),
            },
        ]

        if (this.moonrakerComponents.includes('timelapse')) {
            tabs.push({
                icon: mdiTimelapse,
                name: 'timelapse',
                title: this.$t('Settings.TimelapseTab.Timelapse'),
            })
        }

        return tabs.sort((a, b) => {
            if (a.name === 'general') return -1
            if (b.name === 'general') return 1

            const stringA = a.title.toString().toLowerCase()
            const stringB = b.title.toString().toLowerCase()

            if (stringA < stringB) return -1
            if (stringA > stringB) return 1

            return 0
        })
    }

    @Watch('activeTab')
    activeTabWatch() {
        this.scrollToTop()
    }

    scrollToTop() {
        if (this.$refs.settingsScroll) {
            const overlayscroll = this.$refs.settingsScroll.osInstance()
            overlayscroll?.scroll({ y: '0%' })
        }
    }
}
</script>

<style scoped>
.settings-tabs {
    min-height: 100%;
    height: calc(var(--app-height) - 96px);
}

.settings-tabs-bar {
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    height: 100%;
}

.settings-tabs.height500 {
    height: 500px;
    max-height: calc(var(--app-height) - 111px);
}
</style>

<style>
.settings-tabs .v-select__selections input {
    width: 100px;
}
</style>
