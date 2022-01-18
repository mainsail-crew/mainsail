<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.UiSettingsTab.Logo').toString()">
                    <v-btn
                        v-if="logoColor.toLowerCase() !== defaultLogoColor.toLowerCase()"
                        @click="logoColor = defaultLogoColor"
                        class="minwidth-0"
                        small
                        text
                    >
                        <v-icon small>mdi-restart</v-icon>
                    </v-btn>
                    <v-menu
                        :close-on-content-click="false"
                        bottom
                        left
                        offset-y
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                class="minwidth-0 px-5"
                                :color="logoColor"
                                v-bind="attrs"
                                v-on="on"
                                small
                            ></v-btn>
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
                <settings-row :title="$t('Settings.UiSettingsTab.Primary').toString()">
                    <v-btn
                        v-if="primaryColor.toLowerCase() !== defaultPrimaryColor.toLowerCase()"
                        @click="primaryColor = defaultPrimaryColor"
                        class="minwidth-0"
                        small
                        text
                    >
                        <v-icon small>mdi-restart</v-icon>
                    </v-btn>
                    <v-menu bottom left offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                class="minwidth-0 px-5"
                                :color="primaryColor"
                                v-bind="attrs"
                                v-on="on"
                                small
                            ></v-btn>
                        </template>
                        <v-color-picker
                            @update:color="updatePrimaryColor"
                            :value="primaryColor"
                            hide-mode-switch
                            mode="rgba"
                        ></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.GcodeThumbnails').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.GcodeThumbnailsDescription').toString()"
                    :dynamicSlotWidth="true"
                >
                    <v-btn
                        href="https://docs.mainsail.xyz/quicktips/thumbnails"
                        target="_blank"
                        color="primary"
                        outlined
                        small
                    >
                        {{ $t('Settings.UiSettingsTab.Guide') }}
                    </v-btn>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.BoolBigThumbnail').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.BoolBigThumbnailDescription').toString()"
                    :dynamicSlotWidth="true"
                >
                    <v-switch v-model="boolBigThumbnail" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.UiSettingsTab.ShowWebcamInNavigation').toString()">
                    <v-switch v-model="boolWebcamInNavigation" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.DisplayCANCEL_PRINT').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.DisplayCANCEL_PRINTDescription').toString()"
                    :dynamicSlotWidth="true"
                >
                    <v-switch v-model="displayCancelPrint" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.DisplayZOffset').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.DisplayZOffsetDescription').toString()"
                    :dynamicSlotWidth="true"
                >
                    <v-switch v-model="displayZOffsetStandby" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.LockSliders').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.LockSlidersDescription').toString()"
                    :dynamicSlotWidth="true"
                >
                        <v-switch v-model="lockSliders" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <v-expand-transition>
                    <settings-row
                        v-show="lockSliders"
                        :title="$t('Settings.UiSettingsTab.LockSlidersDelay').toString()"
                        :sub-title="$t('Settings.UiSettingsTab.LockSlidersDelayDescription').toString()"
                        :dynamicSlotWidth="true"
                    >
                            <v-text-field
                                class="mt-0"
                                prepend-icon="mdi-timer-outline"
                                :style="isMobile ? { 'max-width': '140px' } : {}"
                                v-model="lockSlidersDelay"
                                label="Timeout"
                                type="number"
                                :rules="[t => t >= 0]"
                                min="0"
                                step="0.5"
                                suffix="s"
                                hide-details
                                outlined
                                dense
                                hide-spin-buttons
                            ></v-text-field>
                    </settings-row>
                </v-expand-transition>
                <v-divider  v-show="lockSliders" class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ConfirmOnEmergencyStop').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.ConfirmOnEmergencyStopDescription').toString()"
                    :dynamicSlotWidth="true"
                >
                    <v-switch v-model="confirmOnEmergencyStop" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ConfirmOnPowerDeviceChange').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.ConfirmOnPowerDeviceChangeDescription').toString()"
                    :dynamicSlotWidth="true"
                >
                    <v-switch v-model="confirmOnPowerDeviceChange" hide-details class="mt-0"></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.NavigationStyle').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.NavigationStyleDescription').toString()"
                >
                    <v-select
                        v-model="navigationStyleSetting"
                        :items="navigationStyles"
                        class="mt-0"
                        hide-details
                        outlined
                        attach
                        dense
                    ></v-select>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.BoolHideUploadAndPrintButton').toString()"
                    :sub-title="$t('Settings.UiSettingsTab.BoolHideUploadAndPrintButtonDescription').toString()"
                    :dynamicSlotWidth="true"
                >
                    <v-switch v-model="boolHideUploadAndPrintButton" hide-details class="mt-0"></v-switch>
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
        return this.$store.state.gui.uiSettings.logo
    }

    set logoColor(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.logo', value: newVal})
    }

    get primaryColor() {
        return this.$store.state.gui.uiSettings.primary
    }

    set primaryColor(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.primary', value: newVal})
    }

    get boolBigThumbnail() {
        return this.$store.state.gui.uiSettings.boolBigThumbnail
    }

    set boolBigThumbnail(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.boolBigThumbnail', value: newVal })
    }

    get boolWebcamInNavigation() {
        return this.$store.state.gui.uiSettings.boolWebcamNavi ?? false
    }

    set boolWebcamInNavigation(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.boolWebcamNavi', value: newVal })
    }

    get displayCancelPrint() {
        return this.$store.state.gui.uiSettings.displayCancelPrint
    }

    set displayCancelPrint(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.displayCancelPrint', value: newVal })
    }

    get displayZOffsetStandby() {
        return this.$store.state.gui.uiSettings.displayZOffsetStandby
    }

    set displayZOffsetStandby(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.displayZOffsetStandby', value: newVal })
    }

    get confirmOnEmergencyStop() {
        return this.$store.state.gui.uiSettings.confirmOnEmergencyStop
    }

    set confirmOnEmergencyStop(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.confirmOnEmergencyStop', value: newVal })
    }

    get confirmOnPowerDeviceChange() {
        return this.$store.state.gui.uiSettings.confirmOnPowerDeviceChange
    }

    set confirmOnPowerDeviceChange(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.confirmOnPowerDeviceChange', value: newVal })
    }

    get lockSliders() {
        return this.$store.state.gui.uiSettings.lockSlidersOnTouchDevices
    }

    set lockSliders(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.lockSlidersOnTouchDevices', value: newVal})
    }

    get lockSlidersDelay() {
        return this.$store.state.gui.uiSettings.lockSlidersDelay
    }

    set lockSlidersDelay(newVal) {
        (newVal >= 0) ? this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.lockSlidersDelay', value: newVal}) : {}
    }

    get boolWideNavDrawer() {
        return this.$store.state.gui.uiSettings.boolWideNavDrawer ?? false
    }

    get navigationStyleSetting() {
        return this.$store.state.gui.uiSettings.navigationStyle
    }

    set navigationStyleSetting(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.navigationStyle', value: newVal })
    }

    get navigationStyles() {
        return [
            {
                text: this.$t('Settings.UiSettingsTab.NavigationStyleIconsOnly'),
                value: 'iconsOnly'
            },
            {
                text: this.$t('Settings.UiSettingsTab.NavigationStyleIconsAndText'),
                value: 'iconsAndText'
            }
        ]
    }

    get boolHideUploadAndPrintButton() {
        return this.$store.state.gui.uiSettings.boolHideUploadAndPrintButton ?? false
    }

    set boolHideUploadAndPrintButton(newVal) {
        this.$store.dispatch('gui/saveSetting', {name: 'uiSettings.boolHideUploadAndPrintButton', value: newVal })
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