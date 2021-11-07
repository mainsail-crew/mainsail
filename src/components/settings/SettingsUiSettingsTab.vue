<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.UiSettingsTab.Logo')">
                    <v-btn v-if="logoColor.toLowerCase() !== defaultLogoColor.toLowerCase()" small text class="minwidth-0" @click="logoColor = defaultLogoColor"><v-icon small>mdi-restart</v-icon></v-btn>
                    <v-menu bottom left offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" :color="logoColor" class="minwidth-0 px-5" small></v-btn>
                        </template>
                        <v-color-picker
                            :value="logoColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateLogoColor"
                        ></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.Primary')">
                    <v-btn v-if="primaryColor.toLowerCase() !== defaultPrimaryColor.toLowerCase()" small text class="minwidth-0" @click="primaryColor = defaultPrimaryColor"><v-icon small>mdi-restart</v-icon></v-btn>
                    <v-menu bottom left offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" :color="primaryColor" class="minwidth-0 px-5" small></v-btn>
                        </template>
                        <v-color-picker
                            :value="primaryColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updatePrimaryColor"
                        ></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.GcodeThumbnails')" :sub-title="$t('Settings.UiSettingsTab.GcodeThumbnailsDescription')" :dynamicSlotWidth="true">
                    <v-btn outlined small color="primary" href="https://docs.mainsail.xyz/quicktips/thumbnails" target="_blank">{{ $t('Settings.UiSettingsTab.Guide') }}</v-btn>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.BoolBigThumbnail')" :sub-title="$t('Settings.UiSettingsTab.BoolBigThumbnailDescription')" :dynamicSlotWidth="true">
                    <v-switch v-model="boolBigThumbnail" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.ShowWebcamInNavigation')">
                    <v-switch v-model="boolWebcamInNavigation" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.DisplayCANCEL_PRINT')" :sub-title="$t('Settings.UiSettingsTab.DisplayCANCEL_PRINTDescription')" :dynamicSlotWidth="true">
                    <v-switch v-model="displayCancelPrint" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.DisplayZOffset')" :sub-title="$t('Settings.UiSettingsTab.DisplayZOffsetDescription')" :dynamicSlotWidth="true">
                    <v-switch v-model="displayZOffsetStandby" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="'[WIP] Lock sliders on Mobile and Tablet devices'" :sub-title="'Sliders on small display sizes need to be unlocked manually before manipulation is possible'" :dynamicSlotWidth="true">
                        <v-switch v-model="autoLockSliders" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <v-expand-transition>
                    <settings-row v-show="autoLockSliders" :title="'[WIP] Automatic slider locking timeout'" :sub-title="'Lock sliders automatically after a given timeout. If set to 0 or left empty, sliders get automatically locked only by changing pages or on page reload.'" :dynamicSlotWidth="true">
                            <v-text-field
                                class="mt-0"
                                prepend-icon="mdi-timer-outline"
                                :style="isMobile ? { 'max-width': '140px' } : {}"
                                v-model="autoLockSlidersTimeout"
                                label="Timeout"
                                type="number"
                                :rules="[t => t >= 0]"
                                min="0"
                                step="0.5"
                                suffix="s"
                                hide-details
                                outlined
                                dense
                            ></v-text-field>
                    </settings-row>
                </v-expand-transition>
                <v-divider  v-show="autoLockSliders" class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.ConfirmOnEmergencyStop')" :sub-title="$t('Settings.UiSettingsTab.ConfirmOnEmergencyStopDescription')" :dynamicSlotWidth="true">
                    <v-switch v-model="confirmOnEmergencyStop" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.ConfirmOnPowerDeviceChange')" :sub-title="$t('Settings.UiSettingsTab.ConfirmOnPowerDeviceChangeDescription')" :dynamicSlotWidth="true">
                    <v-switch v-model="confirmOnPowerDeviceChange" hide-details class="mt-0"></v-switch>
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">

import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import {defaultLogoColor, defaultPrimaryColor} from '@/store/variables'
import {Debounce} from 'vue-debounce-decorator'

@Component({
    components: {SettingsRow}
})
export default class SettingsUiSettingsTab extends Mixins(BaseMixin) {
    private defaultLogoColor = defaultLogoColor
    private defaultPrimaryColor = defaultPrimaryColor

    get logoColor() {
        return this.$store.state.gui.theme.logo
    }

    set logoColor(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'theme.logo', value: newVal})
    }

    get primaryColor() {
        return this.$store.state.gui.theme.primary
    }

    set primaryColor(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'theme.primary', value: newVal})
    }

    get boolBigThumbnail() {
        return this.$store.state.gui.dashboard.boolBigThumbnail
    }

    set boolBigThumbnail(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'dashboard.boolBigThumbnail', value: newVal })
    }

    get boolWebcamInNavigation() {
        return this.$store.state.gui.webcamSettings.boolNavi ?? false
    }

    set boolWebcamInNavigation(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'webcamSettings.boolNavi', value: newVal })
    }

    get displayCancelPrint() {
        return this.$store.state.gui.general.displayCancelPrint
    }

    set displayCancelPrint(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.displayCancelPrint', value: newVal })
    }

    get displayZOffsetStandby() {
        return this.$store.state.gui.general.displayZOffsetStandby
    }

    set displayZOffsetStandby(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.displayZOffsetStandby', value: newVal })
    }

    get confirmOnEmergencyStop() {
        return this.$store.state.gui.general.confirmOnEmergencyStop
    }

    set confirmOnEmergencyStop(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.confirmOnEmergencyStop', value: newVal })
    }

    get confirmOnPowerDeviceChange() {
        return this.$store.state.gui.general.confirmOnPowerDeviceChange
    }

    set confirmOnPowerDeviceChange(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.confirmOnPowerDeviceChange', value: newVal })
    }

    get autoLockSliders() {
        return this.$store.state.gui.general.autoLockSliders
    }

    set autoLockSliders(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'general.autoLockSliders', value: newVal})
    }

    get autoLockSlidersTimeout() {
        return this.$store.state.gui.general.autoLockSlidersTimeout
    }

    set autoLockSlidersTimeout(newVal) {
        (newVal >= 0) ? this.$store.dispatch('gui/saveSetting', {name: 'general.autoLockSlidersTimeout', value: newVal}) : {}
    }

    clearColorObject(color: any): string {
        if (typeof color === 'object' && 'hex' in color)
            color = color.hex
        if (color.length > 7)
            color = color.substr(0, 7)
        return color
    }

    @Debounce(500)
    updateLogoColor(newVal: any) {
        this.logoColor = this.clearColorObject(newVal)
    }

    @Debounce(500)
    updatePrimaryColor(newVal: any) {
        this.primaryColor = this.clearColorObject(newVal)
    }
}
</script>