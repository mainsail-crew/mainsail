<style scoped>

</style>

<template>
    <div>
        <v-btn color="grey darken-3" class="ml-5 minwidth-0 px-2" @click="showSettings = true">
            <v-icon>mdi-cogs</v-icon>
        </v-btn>
        <v-dialog v-model="showSettings" width="900" persistent :fullscreen="isMobile">
            <v-card>
                <v-toolbar flat dense>
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-cogs</v-icon>{{ $t('Settings.InterfaceSettings') }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0 px-2" color="grey darken-2" @click="showSettings = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-tabs :vertical="!isMobile" :center-active="isMobile" :show-arrows="isMobile" class="settings-tabs">
                    <v-tab class="justify-start"><v-icon left>mdi-cog</v-icon>{{ $t('Settings.GeneralTab.General') }}</v-tab>
                    <v-tab class="justify-start"><v-icon left>mdi-palette</v-icon>{{ $t('Settings.ThemeTab.Theme') }}</v-tab>
                    <v-tab class="justify-start"><v-icon left>mdi-webcam</v-icon>{{ $t('Settings.WebcamTab.Webcams') }}</v-tab>
                    <v-tab class="justify-start"><v-icon left>mdi-code-tags</v-icon>{{ $t('Settings.MacrosTab.Macros') }}</v-tab>
                    <v-tab class="justify-start"><v-icon left>mdi-tune</v-icon>{{ $t('Settings.ControlTab.Control') }}</v-tab>
                    <v-tab class="justify-start"><v-icon left>mdi-console-line</v-icon>{{ $t('Settings.ConsoleTab.Console') }}</v-tab>
                    <v-tab class="justify-start"><v-icon left>mdi-fire</v-icon>{{ $t('Settings.PresetsTab.PreheatPresets') }}</v-tab>
                    <v-tab class="justify-start"><v-icon left>mdi-printer-3d</v-icon>{{ $t('Settings.RemotePrintersTab.RemotePrinters') }}</v-tab>

                    <v-tab-item><settings-general-tab></settings-general-tab></v-tab-item>
                    <v-tab-item><settings-theme-tab></settings-theme-tab></v-tab-item>
                    <v-tab-item><settings-webcam-tab></settings-webcam-tab></v-tab-item>
                    <v-tab-item><settings-macros-tab></settings-macros-tab></v-tab-item>
                    <v-tab-item><settings-control-tab></settings-control-tab></v-tab-item>
                    <v-tab-item><settings-console-tab></settings-console-tab></v-tab-item>
                    <v-tab-item><settings-presets-tab></settings-presets-tab></v-tab-item>
                    <v-tab-item><settings-remote-printers-tab></settings-remote-printers-tab></v-tab-item>
                </v-tabs>
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
    private tab = 0
}
</script>