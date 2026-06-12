<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row
                    :title="$t('Settings.UiSettingsTab.Mode')"
                    :sub-title="$t('Settings.UiSettingsTab.ModeDescription')">
                    <v-select v-model="mode" :items="modes" item-title="text" item-value="value" class="mt-0" hide-details variant="outlined" density="compact" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row
                    :title="$t('Settings.UiSettingsTab.Theme')"
                    :sub-title="$t('Settings.UiSettingsTab.ThemeDescription')">
                    <v-select v-model="themeName" :items="themes" item-title="text" item-value="value" class="mt-0" hide-details variant="outlined" density="compact" />
                </settings-row>
                <v-divider class="my-2" />
                <settings-row :title="$t('Settings.UiSettingsTab.Logo')">
                    <v-btn
                        v-if="logoColor.toLowerCase() !== defaultLogoColor.toLowerCase()"
                        size="small"
                        text
                        class="minwidth-0"
                        @click="logoColor = defaultLogoColor">
                        <v-icon size="small">{{ mdiRestart }}</v-icon>
                    </v-btn>
                    <v-menu location="bottom end" :close-on-content-click="false">
                        <template #activator="{ props: activatorProps }">
                            <v-btn v-bind="activatorProps" :color="logoColor" class="minwidth-0 px-5" size="small" />
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
                        <v-icon size="small">{{ mdiRestart }}</v-icon>
                    </v-btn>
                    <v-menu location="bottom end" :close-on-content-click="false">
                        <template #activator="{ props: activatorProps }">
                            <v-btn v-bind="activatorProps" :color="primaryColor" class="minwidth-0 px-5" size="small" />
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
                            <v-icon size="small">{{ mdiRestart }}</v-icon>
                        </v-btn>
                        <v-menu location="bottom end" :close-on-content-click="false">
                            <template #activator="{ props: activatorProps }">
                                <v-btn
                                    v-bind="activatorProps"
                                    :color="bigThumbnailBackground"
                                    class="minwidth-0 px-5"
                                    small />
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
                        item-title="text"
                        item-value="value"
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
                        item-title="text"
                        item-value="value"
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
                        item-title="text"
                        item-value="value"
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
                        item-title="text"
                        item-value="value"
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

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useBase } from '@/composables/useBase'
import { useTheme } from '@/composables/useTheme'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { defaultLogoColor, defaultPrimaryColor, defaultBigThumbnailBackground, themes } from '@/store/variables'
import { mdiRestart, mdiTimerOutline } from '@mdi/js'
import type { ServerPowerStateDevice } from '@/store/server/power/types'
import { clearColorObject, ColorPickerValue } from '@/plugins/helpers'

const store = useStore()
const { t } = useI18n()
const { isMobile } = useBase()
const { theme } = useTheme()

const mode = computed({
    get: () => store.state.gui.uiSettings.mode,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.mode', value: newVal })
    },
})

const themeName = computed({
    get: () => store.getters['gui/theme'],
    set: (newVal: string) => {
        const newTheme = themes.find((theme) => theme.name === newVal)
        if (logoColor.value === defaultLogoColor) {
            logoColor.value = newTheme?.colorLogo ?? defaultLogoColor
        }
        if (primaryColor.value === defaultPrimaryColor) {
            primaryColor.value = newTheme?.colorPrimary ?? defaultPrimaryColor
        }

        store.dispatch('gui/saveSetting', { name: 'uiSettings.theme', value: newVal })
    },
})

const modes = computed(() => [
    {
        text: t('Settings.UiSettingsTab.ThemeDark'),
        value: 'dark',
    },
    {
        text: t('Settings.UiSettingsTab.ThemeLight'),
        value: 'light',
    },
])

const themesList = computed(() => {
    return themes.map((theme) => {
        return {
            text: theme.displayName,
            value: theme.name,
        }
    })
})

const logoColor = computed({
    get: () => store.state.gui.uiSettings.logo,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.logo', value: newVal })
    },
})

const defaultLogoColorValue = computed(() => theme.value?.colorLogo ?? defaultLogoColor)

const defaultPrimaryColorValue = computed(() => theme.value?.colorPrimary ?? defaultPrimaryColor)

const primaryColor = computed({
    get: () => store.state.gui.uiSettings.primary,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.primary', value: newVal })
    },
})

const boolBigThumbnail = computed({
    get: () => store.state.gui.uiSettings.boolBigThumbnail,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.boolBigThumbnail', value: newVal })
    },
})

const bigThumbnailBackground = computed({
    get: () => store.state.gui.uiSettings.bigThumbnailBackground,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.bigThumbnailBackground', value: newVal })
    },
})

const displayCancelPrint = computed({
    get: () => store.state.gui.uiSettings.displayCancelPrint,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.displayCancelPrint', value: newVal })
    },
})

const progressAsFavicon = computed({
    get: () => store.state.gui.uiSettings.progressAsFavicon,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.progressAsFavicon', value: newVal })
    },
})

const confirmOnEmergencyStop = computed({
    get: () => store.state.gui.uiSettings.confirmOnEmergencyStop,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.confirmOnEmergencyStop', value: newVal })
    },
})

const confirmOnCoolDown = computed({
    get: () => store.state.gui.uiSettings.confirmOnCoolDown,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.confirmOnCoolDown', value: newVal })
    },
})

const confirmOnPowerDeviceChange = computed({
    get: () => store.state.gui.uiSettings.confirmOnPowerDeviceChange,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.confirmOnPowerDeviceChange', value: newVal })
    },
})

const confirmOnCancelJob = computed({
    get: () => store.state.gui.uiSettings.confirmOnCancelJob,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.confirmOnCancelJob', value: newVal })
    },
})

const lockSliders = computed({
    get: () => store.state.gui.uiSettings.lockSlidersOnTouchDevices,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.lockSlidersOnTouchDevices', value: newVal })
    },
})

const lockSlidersDelay = computed({
    get: () => store.state.gui.uiSettings.lockSlidersDelay,
    set: (newVal) => {
        const value = Number(newVal)
        if (!Number.isFinite(value) || value < 0) return

        store.dispatch('gui/saveSetting', { name: 'uiSettings.lockSlidersDelay', value })
    },
})

const navigationStyleSetting = computed({
    get: () => store.state.gui.uiSettings.navigationStyle,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.navigationStyle', value: newVal })
    },
})

const navigationStyles = computed(() => [
    {
        text: t('Settings.UiSettingsTab.NavigationStyleIconsOnly'),
        value: 'iconsOnly',
    },
    {
        text: t('Settings.UiSettingsTab.NavigationStyleIconsAndText'),
        value: 'iconsAndText',
    },
])

const defaultNavigationStateSetting = computed({
    get: () => store.state.gui.uiSettings.defaultNavigationStateSetting,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.defaultNavigationStateSetting', value: newVal })
    },
})

const defaultNavigationStateSettings = computed(() => [
    {
        text: t('Settings.UiSettingsTab.DefaultNavigationStateAlwaysOpen'),
        value: 'alwaysOpen',
    },
    {
        text: t('Settings.UiSettingsTab.DefaultNavigationStateAlwaysClosed'),
        value: 'alwaysClosed',
    },
    {
        text: t('Settings.UiSettingsTab.DefaultNavigationStateLastState'),
        value: 'lastState',
    },
])

const boolHideUploadAndPrintButton = computed({
    get: () => store.state.gui.uiSettings.boolHideUploadAndPrintButton ?? false,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.boolHideUploadAndPrintButton', value: newVal })
    },
})

const powerDevices = computed(() => store.getters['server/power/getDevices'] ?? [])

const autoPowerDevice = computed(() => {
    return (
        powerDevices.value.find((device: ServerPowerStateDevice) => device.device.toLowerCase() === 'printer')
            ?.device ?? '--'
    )
})

const powerDeviceName = computed({
    get: () => store.state.gui.uiSettings.powerDeviceName ?? null,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.powerDeviceName', value: newVal })
    },
})

const powerDeviceOptions = computed(() => {
    const items: { text: string; value: string | null }[] = [
        { text: `Auto (${autoPowerDevice.value})`, value: null },
    ]

    powerDevices.value.forEach((device: ServerPowerStateDevice) => {
        items.push({
            text: `${device.device} (${device.type})`,
            value: device.device.toString(),
        })
    })

    return items
})

const hideSaveConfigForBedMash = computed({
    get: () => store.state.gui.uiSettings.hideSaveConfigForBedMash ?? false,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.hideSaveConfigForBedMash', value: newVal })
    },
})

const disableFanAnimation = computed({
    get: () => store.state.gui.uiSettings.disableFanAnimation ?? false,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.disableFanAnimation', value: newVal })
    },
})

const boolManualProbeDialog = computed({
    get: () => store.state.gui.uiSettings.boolManualProbeDialog ?? true,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.boolManualProbeDialog', value: newVal })
    },
})

const boolBedScrewsDialog = computed({
    get: () => store.state.gui.uiSettings.boolBedScrewsDialog ?? true,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.boolBedScrewsDialog', value: newVal })
    },
})

const boolScrewsTiltAdjustDialog = computed({
    get: () => store.state.gui.uiSettings.boolScrewsTiltAdjustDialog ?? true,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.boolScrewsTiltAdjustDialog', value: newVal })
    },
})

const printstatusThumbnailZoom = computed({
    get: () => store.state.gui.uiSettings.printstatusThumbnailZoom ?? true,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.printstatusThumbnailZoom', value: newVal })
    },
})

const tempchartHeight = computed({
    get: () => store.state.gui.uiSettings.tempchartHeight ?? 250,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.tempchartHeight', value: newVal })
    },
})

const hideUpdateWarnings = computed({
    get: () => store.state.gui.uiSettings.hideUpdateWarnings ?? false,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.hideUpdateWarnings', value: newVal })
    },
})

const dashboardFilesLimit = computed({
    get: () => store.state.gui.uiSettings.dashboardFilesLimit ?? 5,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.dashboardFilesLimit', value: newVal })
    },
})

const dashboardFilesFilter = computed({
    get: () => store.state.gui.uiSettings.dashboardFilesFilter ?? [],
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.dashboardFilesFilter', value: newVal })
    },
})

const dashboardFilesFilters = computed(() => [
    {
        text: t('Settings.UiSettingsTab.DashboardFilesFilterNew'),
        value: 'new',
    },
    {
        text: t('Settings.UiSettingsTab.DashboardFilesFilterFailed'),
        value: 'failed',
    },
    {
        text: t('Settings.UiSettingsTab.DashboardFilesFilterCompleted'),
        value: 'completed',
    },
])

const dashboardHistoryLimit = computed({
    get: () => store.state.gui.uiSettings.dashboardHistoryLimit ?? 5,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.dashboardHistoryLimit', value: newVal })
    },
})

const hideOtherInstances = computed({
    get: () => store.state.gui.uiSettings.hideOtherInstances ?? false,
    set: (newVal) => {
        store.dispatch('gui/saveSetting', { name: 'uiSettings.hideOtherInstances', value: newVal })
    },
})

let logoColorTimer: ReturnType<typeof setTimeout> | null = null
function updateLogoColor(newVal: ColorPickerValue) {
    if (logoColorTimer) clearTimeout(logoColorTimer)
    logoColorTimer = setTimeout(() => {
        logoColor.value = clearColorObject(newVal)
    }, 500)
}

let primaryColorTimer: ReturnType<typeof setTimeout> | null = null
function updatePrimaryColor(newVal: ColorPickerValue) {
    if (primaryColorTimer) clearTimeout(primaryColorTimer)
    primaryColorTimer = setTimeout(() => {
        primaryColor.value = clearColorObject(newVal)
    }, 500)
}

let bigThumbnailTimer: ReturnType<typeof setTimeout> | null = null
function updateBigThumbnailBackground(newVal: ColorPickerValue) {
    if (bigThumbnailTimer) clearTimeout(bigThumbnailTimer)
    bigThumbnailTimer = setTimeout(() => {
        bigThumbnailBackground.value = clearColorObject(newVal)
    }, 500)
}

watch(themeName, (newVal: string) => {
    const themeObj = themes.find((themeData) => themeData.name === newVal)

    if (!themeObj) return

    if (themeObj.colorLogo) logoColor.value = themeObj.colorLogo
})
</script>
