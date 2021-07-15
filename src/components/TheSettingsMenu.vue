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
                        <v-tabs v-model="tabs" :center-active="true" :show-arrows="true">
                            <v-tab
                                v-for="(tab, index) of tabTitles" v-bind:key="index"
                                :href="'#settings-tabs-'+tab.name"
                                class="justify-start">
                                <v-icon left v-html="tab.icon"></v-icon>
                                {{ tab.title }}
                            </v-tab>
                        </v-tabs>
                    </template>
                </v-toolbar>
                <v-row>
                    <v-col class="col-auto pr-0" v-if="!isMobile">
                        <v-tabs v-model="tabs" :vertical="true">
                            <v-tab
                                v-for="(tab, index) of tabTitles" v-bind:key="index"
                                :href="'#settings-tabs-'+tab.name"
                                class="justify-start">
                                <v-icon left v-html="tab.icon"></v-icon>
                                {{ tab.title }}
                            </v-tab>
                        </v-tabs>
                    </v-col>
                    <v-col :class="isMobile ? '' : 'pl-0'">
                        <perfect-scrollbar :class="'settings-tabs '+(isMobile ? '' : 'height500')">
                            <v-tabs-items v-model="tabs">
                                <v-tab-item value="settings-tabs-general"><settings-general-tab></settings-general-tab></v-tab-item>
                                <v-tab-item value="settings-tabs-theme"><settings-theme-tab></settings-theme-tab></v-tab-item>
                                <v-tab-item value="settings-tabs-webcam"><settings-webcam-tab></settings-webcam-tab></v-tab-item>
                                <v-tab-item value="settings-tabs-macros"><settings-macros-tab></settings-macros-tab></v-tab-item>
                                <v-tab-item value="settings-tabs-control"><settings-control-tab></settings-control-tab></v-tab-item>
                                <v-tab-item value="settings-tabs-console"><settings-console-tab></settings-console-tab></v-tab-item>
                                <v-tab-item value="settings-tabs-presets"><settings-presets-tab></settings-presets-tab></v-tab-item>
                                <v-tab-item value="settings-tabs-remote-printers"><settings-remote-printers-tab></settings-remote-printers-tab></v-tab-item>
                            </v-tabs-items>
                        </perfect-scrollbar>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsGeneralTab from "@/components/settings/SettingsGeneralTab.vue";
import SettingsWebcamTab from "@/components/settings/SettingsWebcamTab.vue";
import SettingsMacrosTab from "@/components/settings/SettingsMacrosTab.vue";
import SettingsControlTab from "@/components/settings/SettingsControlTab.vue";
import SettingsConsoleTab from "@/components/settings/SettingsConsoleTab.vue";
import SettingsPresetsTab from "@/components/settings/SettingsPresetsTab.vue";
import SettingsRemotePrintersTab from "@/components/settings/SettingsRemotePrintersTab.vue";
import SettingsThemeTab from "@/components/settings/SettingsThemeTab.vue";
@Component({
    components: {
        SettingsThemeTab,
        SettingsRemotePrintersTab,
        SettingsPresetsTab,
        SettingsConsoleTab, SettingsControlTab, SettingsMacrosTab, SettingsWebcamTab, SettingsGeneralTab}
})
export default class TheSettingsMenu extends Mixins(BaseMixin) {
    private showSettings = false
    private tabs: any = null

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
                title: this.$t('Settings.ThemeTab.Theme')
            },
            {
                icon: 'mdi-presets',
                name: 'fire',
                title: this.$t('Settings.PresetsTab.PreheatPresets')
            },
            {
                icon: 'mdi-printer-3d',
                name: 'remote-printers',
                title: this.$t('Settings.RemotePrintersTab.RemotePrinters')
            },
        ]
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