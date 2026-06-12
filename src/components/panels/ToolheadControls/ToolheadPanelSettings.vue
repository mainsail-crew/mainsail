<template>
    <v-menu :offset-y="true" :left="true" :close-on-content-click="false">
        <template #activator="{ props }">
            <v-btn :icon="mdiCog" rounded="0" v-bind="props" />
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="showPosition"
                    @update:model-value="toggleShowPosition"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.PositionOutput')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="showCoordinates"
                    @update:model-value="toggleShowCoordinates"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.CoordinateFields')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="showControl"
                    @update:model-value="toggleShowControl"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.ControlButtons')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="showZOffset"
                    @update:model-value="toggleShowZOffset"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.ZOffset')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="showSpeedFactor"
                    @update:model-value="toggleShowSpeedFactor"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.ToolheadControlPanel.SpeedFactor')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiCog } from '@mdi/js'

const store = useStore()

const showPosition = computed(() => store.state.gui.view.toolhead.showPosition ?? true)
function toggleShowPosition(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.toolhead.showPosition', value: val })
}

const showCoordinates = computed(() => store.state.gui.view.toolhead.showCoordinates ?? true)
function toggleShowCoordinates(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.toolhead.showCoordinates', value: val })
}

const showControl = computed(() => store.state.gui.view.toolhead.showControl ?? true)
function toggleShowControl(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.toolhead.showControl', value: val })
}

const showZOffset = computed(() => store.state.gui.view.toolhead.showZOffset ?? true)
function toggleShowZOffset(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.toolhead.showZOffset', value: val })
}

const showSpeedFactor = computed(() => store.state.gui.view.toolhead.showSpeedFactor ?? true)
function toggleShowSpeedFactor(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.toolhead.showSpeedFactor', value: val })
}
</script>
