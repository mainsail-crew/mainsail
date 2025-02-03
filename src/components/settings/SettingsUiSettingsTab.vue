<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.Mode')"
                    :sub-title="$t('Settings.UiSettingsTab.ModeDescription')">
                    <v-select v-model="mode" :items="modes" class="mt-0" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.Theme')"
                    :sub-title="$t('Settings.UiSettingsTab.ThemeDescription')">
                    <v-select v-model="themeName" :items="themes" class="mt-0" hide-details outlined dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.UiSettingsTab.Logo')">
                    <v-btn
                        v-if="logoColor.toLowerCase() !== defaultLogoColor.toLowerCase()"
                        small
                        text
                        class="minwidth-0"
                        @click="logoColor = defaultLogoColor">
                        <v-icon small>{{ mdiRestart }}</v-icon>
                    </v-btn>
                    <v-menu bottom left offset-y :close-on-content-click="false">
                        <template #activator="{ on, attrs }">
                            <v-btn v-bind="attrs" :color="logoColor" class="minwidth-0 px-5" small v-on="on" />
                        </template>
                        <v-color-picker
                            :value="logoColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateLogoColor" />
                    </v-menu>
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.UiSettingsTab.Primary')">
                    <v-btn
                        v-if="primaryColor.toLowerCase() !== defaultPrimaryColor.toLowerCase()"
                        small
                        text
                        class="minwidth-0"
                        @click="primaryColor = defaultPrimaryColor">
                        <v-icon small>{{ mdiRestart }}</v-icon>
                    </v-btn>
                    <v-menu bottom left offset-y :close-on-content-click="false">
                        <template #activator="{ on, attrs }">
                            <v-btn v-bind="attrs" :color="primaryColor" class="minwidth-0 px-5" small v-on="on" />
                        </template>
                        <v-color-picker
                            :value="primaryColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updatePrimaryColor" />
                    </v-menu>
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.GcodeThumbnails')"
                    :sub-title="$t('Settings.UiSettingsTab.GcodeThumbnailsDescription')"
                    :dynamic-slot-width="true">
                    <v-btn
                        outlined
                        small
                        color="primary"
                        href="https://docs.mainsail.xyz/overview/features/thumbnails"
                        target="_blank">
                        {{ $t('Settings.UiSettingsTab.Guide') }}
                    </v-btn>
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.BoolBigThumbnail')"
                    :sub-title="$t('Settings.UiSettingsTab.BoolBigThumbnailDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="boolBigThumbnail" hide-details class="mt-0" />
                </settings-row>
                <template v-if="boolBigThumbnail">
                    <v-divider class="my-2" />
                    <settings-row
                        :title="$t('Settings.UiSettingsTab.PrintstatusThumbnailZoom')"
                        :sub-title="$t('Settings.UiSettingsTab.PrintstatusThumbnailZoomDescription')"
                        :dynamic-slot-width="true">
                        <v-switch v-model="printstatusThumbnailZoom" hide-details class="mt-0" />
                    </settings-row>
                    <v-divider class="my-2" />
                    <settings-row :title="$t('Settings.UiSettingsTab.BigThumbnailBackground')">
                        <v-btn
                            v-if="bigThumbnailBackground.toLowerCase() !== defaultBigThumbnailBackground.toLowerCase()"
                            small
                            text
                            class="minwidth-0"
                            @click="bigThumbnailBackground = defaultBigThumbnailBackground">
                            <v-icon small>{{ mdiRestart }}</v-icon>
                        </v-btn>
                        <v-menu bottom left offset-y :close-on-content-click="false">
                            <template #activator="{ on, attrs }">
                                <v-btn
                                    v-bind="attrs"
                                    :color="bigThumbnailBackground"
                                    class="minwidth-0 px-5"
                                    small
                                    v-on="on" />
                            </template>
                            <v-color-picker
                                :value="bigThumbnailBackground"
                                hide-mode-switch
                                mode="rgba"
                                @update:color="updateBigThumbnailBackground" />
                        </v-menu>
                    </settings-row>
                </template>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.DisplayCANCEL_PRINT')"
                    :sub-title="$t('Settings.UiSettingsTab.DisplayCANCEL_PRINTDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="displayCancelPrint" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ProgressAsFavicon')"
                    :sub-title="$t('Settings.UiSettingsTab.ProgressAsFaviconDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="progressAsFavicon" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.LockSliders')"
                    :sub-title="$t('Settings.UiSettingsTab.LockSlidersDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="lockSliders" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <v-expand-transition>
                    <settings-row
                        v-show="lockSliders"
                        :title="$t('Settings.UiSettingsTab.LockSlidersDelay')"
                        :sub-title="$t('Settings.UiSettingsTab.LockSlidersDelayDescription')"
                        :dynamic-slot-width="true">
                        <v-text-field
                            v-model="lockSlidersDelay"
                            class="mt-0"
                            :prepend-icon="mdiTimerOutline"
                            :style="isMobile ? { 'max-width': '140px' } : {}"
                            label="Timeout"
                            type="number"
                            :rules="[(t) => t >= 0]"
                            min="0"
                            step="0.5"
                            suffix="s"
                            hide-details
                            outlined
                            dense
                            hide-spin-buttons />
                    </settings-row>
                </v-expand-transition>
                <v-divider v-show="lockSliders" class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ConfirmOnEmergencyStop')"
                    :sub-title="$t('Settings.UiSettingsTab.ConfirmOnEmergencyStopDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="confirmOnEmergencyStop" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ConfirmOnCoolDown')"
                    :sub-title="$t('Settings.UiSettingsTab.ConfirmOnCoolDownDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="confirmOnCoolDown" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ConfirmOnPowerDeviceChange')"
                    :sub-title="$t('Settings.UiSettingsTab.ConfirmOnPowerDeviceChangeDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="confirmOnPowerDeviceChange" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ConfirmOnCancelJob')"
                    :sub-title="$t('Settings.UiSettingsTab.ConfirmOnCancelJobDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="confirmOnCancelJob" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.NavigationStyle')"
                    :sub-title="$t('Settings.UiSettingsTab.NavigationStyleDescription')">
                    <v-select
                        v-model="navigationStyleSetting"
                        :items="navigationStyles"
                        class="mt-0"
                        hide-details
                        outlined
                        dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.DefaultNavigationState')"
                    :sub-title="$t('Settings.UiSettingsTab.DefaultNavigationStateDescription')">
                    <v-select
                        v-model="defaultNavigationStateSetting"
                        :items="defaultNavigationStateSettings"
                        class="mt-0"
                        hide-details
                        outlined
                        dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.BoolHideUploadAndPrintButton')"
                    :sub-title="$t('Settings.UiSettingsTab.BoolHideUploadAndPrintButtonDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="boolHideUploadAndPrintButton" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.PowerDeviceName')"
                    :sub-title="$t('Settings.UiSettingsTab.PowerDeviceNameDescription')"
                    :dynamic-slot-width="true">
                    <v-select
                        v-model="powerDeviceName"
                        :items="powerDeviceOptions"
                        class="mt-0"
                        hide-details
                        outlined
                        dense />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.HideSaveConfigButtonForBedMesh')"
                    :sub-title="$t('Settings.UiSettingsTab.HideSaveConfigButtonForBedMeshDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="hideSaveConfigForBedMash" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.DisableFanAnimation')"
                    :sub-title="$t('Settings.UiSettingsTab.DisableFanAnimationDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="disableFanAnimation" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ManualProbeDialog')"
                    :sub-title="$t('Settings.UiSettingsTab.ManualProbeDialogDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="boolManualProbeDialog" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.BedScrewsDialog')"
                    :sub-title="$t('Settings.UiSettingsTab.BedScrewsDialogDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="boolBedScrewsDialog" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.ScrewsTiltAdjustDialog')"
                    :sub-title="$t('Settings.UiSettingsTab.ScrewsTiltAdjustDialogDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="boolScrewsTiltAdjustDialog" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.TempchartHeight')"
                    :sub-title="$t('Settings.UiSettingsTab.TempchartHeightDescription')">
                    <v-slider
                        v-model.lazy="tempchartHeight"
                        hide-details
                        :min="100"
                        :max="500"
                        :step="1"
                        :label="tempchartHeight + 'px'" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.HideUpdateWarnings')"
                    :sub-title="$t('Settings.UiSettingsTab.HideUpdateWarningsDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="hideUpdateWarnings" hide-details class="mt-0" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.DashboardFilesLimit')"
                    :sub-title="$t('Settings.UiSettingsTab.DashboardFilesLimitDescription')">
                    <v-slider
                        v-model.lazy="dashboardFilesLimit"
                        hide-details
                        :min="0"
                        :max="10"
                        :step="1"
                        :label="
                            $t('Settings.UiSettingsTab.DashboardFilesLimitLabel', { count: dashboardFilesLimit })
                        " />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.DashboardFilesFilter')"
                    :sub-title="$t('Settings.UiSettingsTab.DashboardFilesFilterDescription')">
                    <v-select
                        v-model="dashboardFilesFilter"
                        :items="dashboardFilesFilters"
                        multiple
                        hide-details
                        dense
                        outlined />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.DashboardHistoryLimit')"
                    :sub-title="$t('Settings.UiSettingsTab.DashboardHistoryLimitDescription')">
                    <v-slider
                        v-model.lazy="dashboardHistoryLimit"
                        hide-details
                        :min="0"
                        :max="10"
                        :step="1"
                        :label="
                            $t('Settings.UiSettingsTab.DashboardHistoryLimitLabel', { count: dashboardHistoryLimit })
                        " />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.HideOtherInstances')"
                    :sub-title="$t('Settings.UiSettingsTab.HideOtherInstancesDescription')"
                    :dynamic-slot-width="true">
                    <v-switch v-model="hideOtherInstances" hide-details class="mt-0" />
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { defaultLogoColor, defaultPrimaryColor, defaultBigThumbnailBackground, themes } from '@/store/variables'
import { Debounce } from 'vue-debounce-decorator'
import { mdiRestart, mdiTimerOutline } from '@mdi/js'
import { ServerPowerStateDevice } from '@/store/server/power/types'
import ThemeMixin from '@/components/mixins/theme'

@Component({
    components: { SettingsRow },
})
export default class SettingsUiSettingsTab extends Mixins(BaseMixin, ThemeMixin) {
    mdiRestart = mdiRestart
    mdiTimerOutline = mdiTimerOutline

    defaultBigThumbnailBackground = defaultBigThumbnailBackground

    get mode() {
        return this.$store.state.gui.uiSettings.mode
    }

    set mode(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.mode', value: newVal })
    }

    get themeName() {
        return this.$store.getters['gui/theme']
    }

    set themeName(newVal: string) {
        const newTheme = themes.find((theme) => theme.name === newVal)
        if (this.logoColor === this.defaultLogoColor) {
            this.logoColor = newTheme?.colorLogo ?? defaultLogoColor
        }
        if (this.primaryColor === this.defaultPrimaryColor) {
            this.primaryColor = newTheme?.colorPrimary ?? defaultPrimaryColor
        }

        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.theme', value: newVal })
    }

    get modes() {
        return [
            {
                text: this.$t('Settings.UiSettingsTab.ThemeDark'),
                value: 'dark',
            },
            {
                text: this.$t('Settings.UiSettingsTab.ThemeLight'),
                value: 'light',
            },
        ]
    }

    get themes() {
        return themes.map((theme) => {
            return {
                text: theme.displayName,
                value: theme.name,
            }
        })
    }

    get logoColor() {
        return this.$store.state.gui.uiSettings.logo
    }

    set logoColor(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.logo', value: newVal })
    }

    get defaultLogoColor() {
        return this.theme?.colorLogo ?? defaultLogoColor
    }

    get defaultPrimaryColor() {
        return this.theme?.colorPrimary ?? defaultPrimaryColor
    }

    get primaryColor() {
        return this.$store.state.gui.uiSettings.primary
    }

    set primaryColor(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.primary', value: newVal })
    }

    get boolBigThumbnail() {
        return this.$store.state.gui.uiSettings.boolBigThumbnail
    }

    set boolBigThumbnail(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.boolBigThumbnail', value: newVal })
    }

    get bigThumbnailBackground() {
        return this.$store.state.gui.uiSettings.bigThumbnailBackground
    }

    set bigThumbnailBackground(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.bigThumbnailBackground', value: newVal })
    }

    get displayCancelPrint() {
        return this.$store.state.gui.uiSettings.displayCancelPrint
    }

    set displayCancelPrint(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.displayCancelPrint', value: newVal })
    }

    get progressAsFavicon() {
        return this.$store.state.gui.uiSettings.progressAsFavicon
    }

    set progressAsFavicon(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.progressAsFavicon', value: newVal })
    }

    get confirmOnEmergencyStop() {
        return this.$store.state.gui.uiSettings.confirmOnEmergencyStop
    }

    set confirmOnEmergencyStop(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.confirmOnEmergencyStop', value: newVal })
    }

    get confirmOnCoolDown() {
        return this.$store.state.gui.uiSettings.confirmOnCoolDown
    }

    set confirmOnCoolDown(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.confirmOnCoolDown', value: newVal })
    }

    get confirmOnPowerDeviceChange() {
        return this.$store.state.gui.uiSettings.confirmOnPowerDeviceChange
    }

    set confirmOnPowerDeviceChange(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.confirmOnPowerDeviceChange', value: newVal })
    }

    get confirmOnCancelJob() {
        return this.$store.state.gui.uiSettings.confirmOnCancelJob
    }

    set confirmOnCancelJob(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.confirmOnCancelJob', value: newVal })
    }

    get lockSliders() {
        return this.$store.state.gui.uiSettings.lockSlidersOnTouchDevices
    }

    set lockSliders(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.lockSlidersOnTouchDevices', value: newVal })
    }

    get lockSlidersDelay() {
        return this.$store.state.gui.uiSettings.lockSlidersDelay
    }

    set lockSlidersDelay(newVal) {
        newVal >= 0
            ? this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.lockSlidersDelay', value: newVal })
            : {}
    }

    get boolWideNavDrawer() {
        return this.$store.state.gui.uiSettings.boolWideNavDrawer ?? false
    }

    get navigationStyleSetting() {
        return this.$store.state.gui.uiSettings.navigationStyle
    }

    set navigationStyleSetting(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.navigationStyle', value: newVal })
    }

    get navigationStyles() {
        return [
            {
                text: this.$t('Settings.UiSettingsTab.NavigationStyleIconsOnly'),
                value: 'iconsOnly',
            },
            {
                text: this.$t('Settings.UiSettingsTab.NavigationStyleIconsAndText'),
                value: 'iconsAndText',
            },
        ]
    }

    get defaultNavigationStateSetting() {
        return this.$store.state.gui.uiSettings.defaultNavigationStateSetting
    }

    set defaultNavigationStateSetting(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.defaultNavigationStateSetting', value: newVal })
    }

    get defaultNavigationStateSettings() {
        return [
            {
                text: this.$t('Settings.UiSettingsTab.DefaultNavigationStateAlwaysOpen'),
                value: 'alwaysOpen',
            },
            {
                text: this.$t('Settings.UiSettingsTab.DefaultNavigationStateAlwaysClosed'),
                value: 'alwaysClosed',
            },
            {
                text: this.$t('Settings.UiSettingsTab.DefaultNavigationStateLastState'),
                value: 'lastState',
            },
        ]
    }

    get boolHideUploadAndPrintButton() {
        return this.$store.state.gui.uiSettings.boolHideUploadAndPrintButton ?? false
    }

    set boolHideUploadAndPrintButton(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.boolHideUploadAndPrintButton', value: newVal })
    }

    get powerDevices() {
        return this.$store.getters['server/power/getDevices'] ?? []
    }

    get autoPowerDevice() {
        return (
            this.powerDevices.find((device: ServerPowerStateDevice) => device.device.toLowerCase() === 'printer')
                ?.device ?? '--'
        )
    }

    get powerDeviceName() {
        return this.$store.state.gui.uiSettings.powerDeviceName ?? null
    }

    set powerDeviceName(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.powerDeviceName', value: newVal })
    }

    get powerDeviceOptions() {
        const items: { text: string; value: string | null }[] = [
            { text: `Auto (${this.autoPowerDevice})`, value: null },
        ]

        this.powerDevices.forEach((device: ServerPowerStateDevice) => {
            items.push({
                text: `${device.device} (${device.type})`,
                value: device.device.toString(),
            })
        })

        return items
    }

    get hideSaveConfigForBedMash() {
        return this.$store.state.gui.uiSettings.hideSaveConfigForBedMash ?? false
    }

    set hideSaveConfigForBedMash(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.hideSaveConfigForBedMash', value: newVal })
    }

    get disableFanAnimation() {
        return this.$store.state.gui.uiSettings.disableFanAnimation ?? false
    }

    set disableFanAnimation(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.disableFanAnimation', value: newVal })
    }

    get boolManualProbeDialog() {
        return this.$store.state.gui.uiSettings.boolManualProbeDialog ?? true
    }

    set boolManualProbeDialog(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.boolManualProbeDialog', value: newVal })
    }

    get boolBedScrewsDialog() {
        return this.$store.state.gui.uiSettings.boolBedScrewsDialog ?? true
    }

    set boolBedScrewsDialog(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.boolBedScrewsDialog', value: newVal })
    }

    get boolScrewsTiltAdjustDialog() {
        return this.$store.state.gui.uiSettings.boolScrewsTiltAdjustDialog ?? true
    }

    set boolScrewsTiltAdjustDialog(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.boolScrewsTiltAdjustDialog', value: newVal })
    }

    get printstatusThumbnailZoom() {
        return this.$store.state.gui.uiSettings.printstatusThumbnailZoom ?? true
    }

    set printstatusThumbnailZoom(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.printstatusThumbnailZoom', value: newVal })
    }

    get tempchartHeight() {
        return this.$store.state.gui.uiSettings.tempchartHeight ?? 250
    }

    set tempchartHeight(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.tempchartHeight', value: newVal })
    }

    get hideUpdateWarnings() {
        return this.$store.state.gui.uiSettings.hideUpdateWarnings ?? false
    }

    set hideUpdateWarnings(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.hideUpdateWarnings', value: newVal })
    }

    get dashboardFilesLimit() {
        return this.$store.state.gui.uiSettings.dashboardFilesLimit ?? 5
    }

    set dashboardFilesLimit(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.dashboardFilesLimit', value: newVal })
    }

    get dashboardFilesFilter() {
        return this.$store.state.gui.uiSettings.dashboardFilesFilter ?? []
    }

    set dashboardFilesFilter(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.dashboardFilesFilter', value: newVal })
    }

    get dashboardFilesFilters() {
        return [
            {
                text: this.$t('Settings.UiSettingsTab.DashboardFilesFilterNew'),
                value: 'new',
            },
            {
                text: this.$t('Settings.UiSettingsTab.DashboardFilesFilterFailed'),
                value: 'failed',
            },
            {
                text: this.$t('Settings.UiSettingsTab.DashboardFilesFilterCompleted'),
                value: 'completed',
            },
        ]
    }

    get dashboardHistoryLimit() {
        return this.$store.state.gui.uiSettings.dashboardHistoryLimit ?? 5
    }

    set dashboardHistoryLimit(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.dashboardHistoryLimit', value: newVal })
    }

    get hideOtherInstances() {
        return this.$store.state.gui.uiSettings.hideOtherInstances ?? false
    }

    set hideOtherInstances(newVal) {
        this.$store.dispatch('gui/saveSetting', { name: 'uiSettings.hideOtherInstances', value: newVal })
    }

    clearColorObject(color: any): string {
        if (typeof color === 'object' && 'hex' in color) color = color.hex
        if (color.length > 7) color = color.substr(0, 7)
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

    @Debounce(500)
    updateBigThumbnailBackground(newVal: any) {
        this.bigThumbnailBackground = this.clearColorObject(newVal)
    }

    @Watch('theme')
    onThemeChanged(newVal: string) {
        const theme = themes.find((theme) => theme.name === newVal)

        // stop here when no theme was found with this name
        if (!theme) return

        // update logo color to theme logo color if the theme has a colorLogo
        if (theme.colorLogo) this.logoColor = theme.colorLogo
    }
}
</script>
