<template>
    <div>
        <v-row v-if="isMobile">
            <v-col>
                <status-panel />
                <template v-for="component in mobileLayout">
                    <component
                        v-if="isPanelKnown(component.name)"
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-mobileLayout-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isTablet">
            <v-col class="col-6">
                <status-panel />
                <template v-for="component in tabletLayout1">
                    <component
                        v-if="isPanelKnown(component.name)"
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-tabletLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col class="col-6">
                <template v-for="component in tabletLayout2">
                    <component
                        v-if="isPanelKnown(component.name)"
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-tabletLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isDesktop">
            <v-col class="col-5">
                <status-panel />
                <template v-for="component in desktopLayout1">
                    <component
                        v-if="isPanelKnown(component.name)"
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col class="col-7">
                <template v-for="component in desktopLayout2">
                    <component
                        v-if="isPanelKnown(component.name)"
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
        <v-row v-else-if="isWidescreen">
            <v-col class="col-3">
                <status-panel />
                <template v-for="component in widescreenLayout1">
                    <component
                        v-if="isPanelKnown(component.name)"
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout1-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col class="col-5">
                <template v-for="component in widescreenLayout2">
                    <component
                        v-if="isPanelKnown(component.name)"
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout2-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
            <v-col class="col-4">
                <template v-for="component in widescreenLayout3">
                    <component
                        v-if="isPanelKnown(component.name)"
                        :is="extractPanelName(component.name)"
                        :key="'dashboard-desktopLayout3-' + component.name"
                        :panel-id="extractPanelId(component.name)"></component>
                </template>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useDashboard } from '@/composables/useDashboard'
import CncStatusPanel from '@/components/panels/Cnc/CncStatusPanel.vue'
import DroPanel from '@/components/panels/Cnc/DroPanel.vue'
import JogPanel from '@/components/panels/Cnc/JogPanel.vue'
import KlippyStatePanel from '@/components/panels/KlippyStatePanel.vue'
import LedEffectsPanel from '@/components/panels/LedEffectsPanel.vue'
import MachineSettingsPanel from '@/components/panels/MachineSettingsPanel.vue'
import MacrogroupPanel from '@/components/panels/MacrogroupPanel.vue'
import MacrosPanel from '@/components/panels/MacrosPanel.vue'
import MiniconsolePanel from '@/components/panels/MiniconsolePanel.vue'
import MinSettingsPanel from '@/components/panels/MinSettingsPanel.vue'
import MiscellaneousPanel from '@/components/panels/MiscellaneousPanel.vue'
import OffsetsPanel from '@/components/panels/Cnc/OffsetsPanel.vue'
import SpindleCoolantPanel from '@/components/panels/Cnc/SpindleCoolantPanel.vue'
import StatusPanel from '@/components/panels/StatusPanel.vue'
import ToolheadControlPanel from '@/components/panels/ToolheadControlPanel.vue'
import TemperaturePanel from '@/components/panels/TemperaturePanel.vue'
import WebcamPanel from '@/components/panels/WebcamPanel.vue'

const store = useStore()
const { isMobile, isTablet, isDesktop, isWidescreen } = useDashboard()

const mobileLayout = computed(() => store.getters['gui/getPanels']('mobile', 0, true))
const tabletLayout1 = computed(() => store.getters['gui/getPanels']('tablet', 1, true))
const tabletLayout2 = computed(() => store.getters['gui/getPanels']('tablet', 2, true))
const desktopLayout1 = computed(() => store.getters['gui/getPanels']('desktop', 1, true))
const desktopLayout2 = computed(() => store.getters['gui/getPanels']('desktop', 2, true))
const widescreenLayout1 = computed(() => store.getters['gui/getPanels']('widescreen', 1, true))
const widescreenLayout2 = computed(() => store.getters['gui/getPanels']('widescreen', 2, true))
const widescreenLayout3 = computed(() => store.getters['gui/getPanels']('widescreen', 3, true))

function extractPanelName(name: string) {
    return name.split('_')[0] + '-panel'
}

function extractPanelId(name: string) {
    return name.split('_')[1] ?? null
}

const registeredPanelNames = new Set([
    'cnc-status', 'dro', 'jog', 'offsets', 'spindle-coolant', 'mdi',
    'klippystate', 'minsettings', 'status',
    'ledeffects', 'machinesettings', 'macrogroup', 'macros',
    'miniconsole', 'miscellaneous', 'toolhead-control', 'temperature', 'webcam',
])

function isPanelKnown(name: string): boolean {
    const prefix = name.split('_')[0]
    return registeredPanelNames.has(prefix)
}
</script>
