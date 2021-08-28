<template>
    <div>
        <v-btn color="grey darken-3" class="ml-5 minwidth-0 px-2" @click="showSettings = true">
            <v-icon>mdi-cogs</v-icon>
        </v-btn>
        <v-dialog v-model="showSettings" width="900" persistent :fullscreen="isMobile">
            <v-card style="overflow: hidden;" :height="isMobile ? 0 : 548">
                <v-toolbar flat dense>
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-cogs</v-icon>{{ $t('Settings.InterfaceSettings') }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0 px-2" color="grey darken-2" @click="showSettings = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                    <template v-if="isMobile" v-slot:extension>
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
                </v-toolbar>
                <v-row>
                    <v-col class="col-auto pr-0" v-if="!isMobile">
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
                    </v-col>
                    <v-col :class="isMobile ? '' : 'pl-0'">
                        <perfect-scrollbar :class="'settings-tabs '+(isMobile ? '' : 'height500')" ref="settingsScroll">
                            <component :is="'settings-'+activeTab+'-tab'"></component>
                        </perfect-scrollbar>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import {Mixins, Watch} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsGeneralTab from "@/components/settings/SettingsGeneralTab.vue";
import SettingsWebcamTab from "@/components/settings/SettingsWebcamTab.vue";
import SettingsMacrosTab from "@/components/settings/SettingsMacrosTab.vue";
import SettingsControlTab from "@/components/settings/SettingsControlTab.vue";
import SettingsConsoleTab from "@/components/settings/SettingsConsoleTab.vue";
import SettingsPresetsTab from "@/components/settings/SettingsPresetsTab.vue";
import SettingsRemotePrintersTab from "@/components/settings/SettingsRemotePrintersTab.vue";
import SettingsThemeTab from "@/components/settings/SettingsThemeTab.vue";
import SettingsDashboardTab from "@/components/settings/SettingsDashboardTab.vue";
import SettingsGCodeViewerTab from "@/components/settings/SettingsGCodeViewerTab.vue"
@Component({
    components: {
        SettingsThemeTab,
        SettingsRemotePrintersTab,
        SettingsPresetsTab,
        SettingsConsoleTab,
        SettingsControlTab,
        SettingsMacrosTab,
        SettingsWebcamTab,
        SettingsGeneralTab,
        SettingsDashboardTab,
        SettingsGCodeViewerTab
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
            }
        ]
    }

    @Watch('activeTab')
    activeTabWatch() {
        if (this.$refs.settingsScroll) this.$refs.settingsScroll.$el.scrollTop = 0
    }
}
</script>

<style scoped>
    .settings-tabs {
        height: auto;
        max-height: calc(100vh - 96px);
    }

    .settings-tabs.height500 {
        max-height: 500px;
    }
</style>