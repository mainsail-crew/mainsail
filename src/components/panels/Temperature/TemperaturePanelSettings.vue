<template>
    <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Panels.TemperaturePanel.SetupTemperatures')">
        <template #activator="{ on, attrs }">
            <v-btn icon tile v-bind="attrs" v-on="on">
                <v-icon small>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="boolTempchart"
                    @update:model-value="toggleBoolTempchart"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.TemperaturePanel.ShowChart')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="hideMcuHostSensors"
                    @update:model-value="toggleHideMcuHostSensors"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.TemperaturePanel.HideMcuHostSensors')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="hideMonitors"
                    @update:model-value="toggleHideMonitors"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.TemperaturePanel.HideMonitors')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    :model-value="autoscaleTempchart"
                    @update:model-value="toggleAutoscaleTempchart"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.TemperaturePanel.AutoscaleChart')" />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiCog } from '@mdi/js'

const store = useStore()
const mdiCog = mdiCog

const boolTempchart = computed(() => store.state.gui.view.tempchart.boolTempchart ?? false)
function toggleBoolTempchart(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.tempchart.boolTempchart', value: val })
}

const autoscaleTempchart = computed(() => store.state.gui.view.tempchart.autoscale ?? false)
function toggleAutoscaleTempchart(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.tempchart.autoscale', value: val })
}

const hideMcuHostSensors = computed(() => store.state.gui.view.tempchart.hideMcuHostSensors ?? false)
function toggleHideMcuHostSensors(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.tempchart.hideMcuHostSensors', value: val })
}

const hideMonitors = computed(() => store.state.gui.view.tempchart.hideMonitors ?? false)
function toggleHideMonitors(val: boolean) {
    store.dispatch('gui/saveSetting', { name: 'view.tempchart.hideMonitors', value: val })
}
</script>
