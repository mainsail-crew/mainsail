<template>
    <div>
        <v-btn icon tile @click="showSettings = true">
            <v-icon>mdi-cogs</v-icon>
        </v-btn>
        <v-dialog v-model="showSettings" width="900" persistent :fullscreen="isMobile" @keydown.esc="showSettings = false" scrollable>
            <panel :title="$t('Settings.InterfaceSettings')" icon="mdi-cogs" card-class="settings-menu-dialog" :margin-bottom="false" style="overflow: hidden;" :height="isMobile ? 0 : 548">
                <template v-slot:buttons>
                    <v-btn icon tile @click="showSettings = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <template v-if="isMobile">
                    <v-tabs v-model="activeTab" :center-active="true" :show-arrows="true">
                        <v-tab
                            v-for="(tab, index) of tabTitles" v-bind:key="index"
                            :href="'#'+tab.name"
                            class="justify-start">
                            <v-icon left v-html="tab.icon"></v-icon>
                            {{ tab.title }}
                        </v-tab>
                    </v-tabs>
                </template>
                <v-row class="flex-row flex-nowrap">
                    <v-col class="col-auto pr-0" v-if="!isMobile">
                        <overlay-scrollbars class="settings-tabs-bar height500" ref="settingsTabsScroll">
                            <v-tabs v-model="activeTab" :vertical="true">
                                <v-tab
                                    v-for="(tab, index) of tabTitles" v-bind:key="index"
                                    :href="'#'+tab.name"
                                    class="justify-start"
                                    style="width: 200px;"
                                >
                                    <v-icon left v-html="tab.icon"></v-icon>
                                    <span class="text-truncate">{{ tab.title }}</span>
                                </v-tab>
                            </v-tabs>
                        </overlay-scrollbars>
                    </v-col>
                    <v-col :class="isMobile ? '' : 'pl-0'" :style="isMobile ? '' : 'min-width: 500px;'">
                        <overlay-scrollbars :class="'settings-tabs '+(isMobile ? '' : 'height500')" ref="settingsScroll" :options="{ overflowBehavior: { x: 'hidden' } }">
                            <component :is="'settings-'+activeTab+'-tab'" @scrollToTop="scrollToTop"></component>
                        </overlay-scrollbars>
                    </v-col>
                </v-row>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {Mixins, Watch} from 'vue-property-decorator'
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
        SettingsTimelapseTab
    }
})
export default class TheSettingsMenu extends Mixins(BaseMixin) {
    private showSettings = false
    private activeTab = 'general'

    $refs!: {
        settingsScroll: any
    }

    get tabTitles() {
        const tabs = [
            {
                icon: 'mdi-cog',
                name: 'general',
                title: this.$t('Settings.GeneralTab.General')
            },
            {
                icon: 'mdi-palette',
                name: 'ui-settings',
                title: this.$t('Settings.UiSettingsTab.UiSettings')
            },
            {
                icon: 'mdi-monitor-dashboard',
                name: 'dashboard',
                title: this.$t('Settings.DashboardTab.Dashboard')
            },
            {
                icon: 'mdi-webcam',
                name: 'webcams',
                title: this.$t('Settings.WebcamsTab.Webcams')
            },
            {
                icon: 'mdi-code-tags',
                name: 'macros',
                title: this.$t('Settings.MacrosTab.Macros')
            },
            {
                icon: 'mdi-tune',
                name: 'control',
                title: this.$t('Settings.ControlTab.Control')
            },
            {
                icon: 'mdi-console-line',
                name: 'console',
                title: this.$t('Settings.ConsoleTab.Console')
            },
            {
                icon: 'mdi-fire',
                name: 'presets',
                title: this.$t('Settings.PresetsTab.PreheatPresets')
            },
            {
                icon: 'mdi-printer-3d',
                name: 'remote-printers',
                title: this.$t('Settings.RemotePrintersTab.RemotePrinters')
            },
            {
                icon: 'mdi-video-3d',
                name: 'g-code-viewer',
                title: this.$t('Settings.GCodeViewerTab.GCodeViewer')
            },
            {
                icon: 'mdi-file-document-edit-outline',
                name: 'editor',
                title: this.$t('Settings.EditorTab.Editor')
            }
        ]

        if (this.moonrakerComponents.includes('timelapse')) {
            tabs.push({
                icon: 'mdi-timelapse',
                name: 'timelapse',
                title: this.$t('Settings.TimelapseTab.Timelapse')
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