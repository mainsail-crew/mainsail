<template>
    <div>
        <v-btn color="grey darken-3" class="ml-5 minwidth-0 px-2" @click="showSettings = true">
            <v-icon>mdi-cogs</v-icon>
        </v-btn>
        <v-dialog v-model="showSettings" width="900" persistent :fullscreen="isMobile">
            <panel :title="$t('Settings.InterfaceSettings')" icon="mdi-cogs" card-class="settings-menu-dialog" :margin-bottom="false" style="overflow: hidden;" :height="isMobile ? 0 : 548">
                <template v-slot:buttons>
                    <v-btn icon @click="showSettings = false"><v-icon>mdi-close-thick</v-icon></v-btn>
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
                <v-row>
                    <v-col class="col-auto pr-0" v-if="!isMobile">
                        <perfect-scrollbar class="settings-tabs-bar height500" ref="settingsTabsScroll">
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
                        </perfect-scrollbar>
                    </v-col>
                    <v-col :class="isMobile ? '' : 'pl-0'">
                        <perfect-scrollbar :class="'settings-tabs '+(isMobile ? '' : 'height500')" ref="settingsScroll" :options="{ suppressScrollX: true }">
                            <component :is="'settings-'+activeTab+'-tab'" @scrollToTop="scrollToTop"></component>
                        </perfect-scrollbar>
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
import SettingsWebcamTab from '@/components/settings/SettingsWebcamTab.vue'
import SettingsMacrosTab from '@/components/settings/SettingsMacrosTab.vue'
import SettingsControlTab from '@/components/settings/SettingsControlTab.vue'
import SettingsConsoleTab from '@/components/settings/SettingsConsoleTab.vue'
import SettingsPresetsTab from '@/components/settings/SettingsPresetsTab.vue'
import SettingsRemotePrintersTab from '@/components/settings/SettingsRemotePrintersTab.vue'
import SettingsThemeTab from '@/components/settings/SettingsThemeTab.vue'
import SettingsDashboardTab from '@/components/settings/SettingsDashboardTab.vue'
import SettingsGCodeViewerTab from '@/components/settings/SettingsGCodeViewerTab.vue'
import SettingsEditorTab from '@/components/settings/SettingsEditorTab.vue'

import Panel from '@/components/ui/Panel.vue'
@Component({
    components: {
        Panel,
        SettingsThemeTab,
        SettingsRemotePrintersTab,
        SettingsPresetsTab,
        SettingsConsoleTab,
        SettingsControlTab,
        SettingsMacrosTab,
        SettingsWebcamTab,
        SettingsGeneralTab,
        SettingsDashboardTab,
        SettingsGCodeViewerTab,
        SettingsEditorTab
    }
})
export default class TheSettingsMenu extends Mixins(BaseMixin) {
    private showSettings = false
    private activeTab = 'general'

    $refs!: {
        settingsScroll: any
    }

    get tabTitles() {
        return [
            {
                icon: 'mdi-cog',
                name: 'general',
                title: this.$t('Settings.GeneralTab.General')
            },
            {
                icon: 'mdi-palette',
                name: 'theme',
                title: this.$t('Settings.ThemeTab.Theme')
            },
            {
                icon: 'mdi-monitor-dashboard',
                name: 'dashboard',
                title: this.$t('Settings.DashboardTab.Dashboard')
            },
            {
                icon: 'mdi-webcam',
                name: 'webcam',
                title: this.$t('Settings.WebcamTab.Webcams')
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
        ].sort((a, b) => {
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
        if (this.$refs.settingsScroll) this.$refs.settingsScroll.$el.scrollTop = 0
    }
}
</script>

<style scoped>
    .settings-tabs {
        height: auto;
        max-height: calc(100vh - 96px);
    }

    .settings-tabs-bar {
        border-right: 1px solid rgba(255, 255, 255, 0.12);
    }

    .settings-tabs-bar.height500,
    .settings-tabs.height500 {
        max-height: 500px;
    }
</style>