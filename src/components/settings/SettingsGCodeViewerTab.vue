<template>
    <div>
        <v-card flat>
            <v-card-text>
                <settings-row :title="$t('Settings.GCodeViewerTab.ShowAxes')">
                    <v-switch v-model="showAxes" class="mt-0" hide-details></v-switch>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.BackgroundColor')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template #activator="{ props }">
                            <v-btn
                                :color="backgroundColor"
                                class="minwidth-0 px-5"
                                small
                                v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="backgroundColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('backgroundColor', $event)"></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.GridColor')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template #activator="{ props }">
                            <v-btn :color="gridColor" class="minwidth-0 px-5" small v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="gridColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('gridColor', $event)"></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.ProgressColor')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template #activator="{ props }">
                            <v-btn
                                :color="progressColor"
                                class="minwidth-0 px-5"
                                small
                                v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="progressColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('progressColor', $event)"></v-color-picker>
                    </v-menu>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.ExtruderColor')">
                    <v-row no-gutters>
                            <v-menu
                                v-for="(extruderColor, index) in extruderColors"
                                :key="index"
                                :close-on-content-click="false"
                                bottom
                                left
                                offset-y>
                                <template #activator="{ props }">
                                    <v-col align="right" class="mt-1" cols="12">
                                        <span class="mr-2">{{ index }}</span>
                                        <v-btn
                                            :color="extruderColors[index]"
                                            class="minwidth-0 px-5"
                                            small
                                            v-bind="props"></v-btn>
                                </v-col>
                            </template>
                            <v-color-picker
                                :value="extruderColors[index]"
                                hide-mode-switch
                                mode="rgba"
                                @update:color="colorsUpdated($event, index)"></v-color-picker>
                        </v-menu>
                    </v-row>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.MinFeed')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template #activator="{ props }">
                            <v-btn
                                :color="minFeedColor"
                                class="minwidth-0 px-5 mr-3"
                                small
                                v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="minFeedColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('minFeedColor', $event)"></v-color-picker>
                    </v-menu>
                    <v-text-field
                        v-model="minFeed"
                        :rules="[(v) => v > 0 || 'Minimum speed is 1']"
                        dense
                        hide-details="auto"
                        outlined
                        suffix="mm/s"
                        type="number"
                        hide-spin-buttons
                        @blur="feedBlur"></v-text-field>
                </settings-row>
                <v-divider class="my-2"></v-divider>
                <settings-row :title="$t('Settings.GCodeViewerTab.MaxFeed')">
                    <v-menu :close-on-content-click="false" bottom left offset-y>
                        <template #activator="{ props }">
                            <v-btn
                                :color="maxFeedColor"
                                class="minwidth-0 px-5 mr-3"
                                small
                                v-bind="props"></v-btn>
                        </template>
                        <v-color-picker
                            :value="maxFeedColor"
                            hide-mode-switch
                            mode="rgba"
                            @update:color="updateColorValue('maxFeedColor', $event)"></v-color-picker>
                    </v-menu>
                    <v-text-field
                        v-model="maxFeed"
                        :rules="[(v) => v > 0 || 'Minimum speed is 1']"
                        dense
                        hide-details="auto"
                        outlined
                        suffix="mm/s"
                        type="number"
                        hide-spin-buttons
                        @blur="feedBlur"></v-text-field>
                </settings-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { clearColorObject, ColorPickerValue } from '@/plugins/helpers'

const store = useStore()

const showAxes = computed({
    get: () => store.state.gui.gcodeViewer.showAxes,
    set: (newVal: boolean) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.showAxes', value: newVal })
    },
})

const extruderColors = computed(() => store.state.gui.gcodeViewer.extruderColors)

let colorsDebounceTimer: ReturnType<typeof setTimeout> | null = null
function colorsUpdated(value: ColorPickerValue, index: number): void {
    if (colorsDebounceTimer) clearTimeout(colorsDebounceTimer)
    colorsDebounceTimer = setTimeout(() => {
        const colors = [...extruderColors.value]
        colors[index] = clearColorObject(value)
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.extruderColors', value: colors })
    }, 500)
}

const backgroundColor = computed({
    get: () => store.state.gui.gcodeViewer.backgroundColor,
    set: (newVal: string) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.backgroundColor', value: newVal })
    },
})

const gridColor = computed({
    get: () => store.state.gui.gcodeViewer.gridColor,
    set: (newVal: string) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.gridColor', value: newVal })
    },
})

const progressColor = computed({
    get: () => store.state.gui.gcodeViewer.progressColor,
    set: (newVal: string) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.progressColor', value: newVal })
    },
})

let updateColorDebounceTimer: ReturnType<typeof setTimeout> | null = null

function updateColorValue(colorElement: string, newVal: ColorPickerValue): void {
    if (updateColorDebounceTimer) clearTimeout(updateColorDebounceTimer)
    updateColorDebounceTimer = setTimeout(() => {
        store.dispatch('gui/saveSetting', { name: `gcodeViewer.${colorElement}`, value: clearColorObject(newVal) })
    }, 500)
}

const minFeed = computed({
    get: () => store.state.gui.gcodeViewer.minFeed,
    set: (newVal: number) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.minFeed', value: newVal })
    },
})

const maxFeed = computed({
    get: () => store.state.gui.gcodeViewer.maxFeed,
    set: (newVal: number) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.maxFeed', value: newVal })
    },
})

const minFeedColor = computed({
    get: () => store.state.gui.gcodeViewer.minFeedColor,
    set: (newVal: string) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.minFeedColor', value: newVal })
    },
})

const maxFeedColor = computed({
    get: () => store.state.gui.gcodeViewer.maxFeedColor,
    set: (newVal: string) => {
        store.dispatch('gui/saveSetting', { name: 'gcodeViewer.maxFeedColor', value: newVal })
    },
})

function feedBlur(): void {
    if (minFeed.value < 1) minFeed.value = 1
    if (maxFeed.value < minFeed.value) maxFeed.value = minFeed.value + 1
}
</script>
