<template>
    <panel
        v-if="klipperReadyForGui"
        :icon="mdiGamepad"
        :title="$t('Panels.ToolheadControlPanel.Headline')"
        :collapsible="true"
        card-class="toolhead-control-panel">
        <template #buttons>
            <v-menu v-if="showButtons" left offset-y :close-on-content-click="false" class="pa-0">
                <template #activator="{ props }">
                    <v-btn icon v-bind="props" :disabled="['printing'].includes(printer_state)">
                        <v-icon>{{ mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <v-list-item v-if="controlStyle !== 'bars' && actionButton !== 'm84'">
                        <v-btn small style="width: 100%" @click="doSend('M84')">
                            <v-icon left small>{{ mdiEngineOff }}</v-icon>
                            {{ $t('Settings.ControlTab.MotorsOff', { isDefault: '' }) }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item v-if="controlStyle !== 'bars' && existsZtilt && actionButton !== 'ztilt'">
                        <v-btn small style="width: 100%" @click="doZtilt">Z-Tilt Adjust</v-btn>
                    </v-list-item>
                    <v-list-item v-if="controlStyle !== 'bars' && existsQGL && actionButton !== 'qgl'">
                        <v-btn small style="width: 100%" @click="doQGL">Quad Gantry Level</v-btn>
                    </v-list-item>
                    <v-list-item v-if="existsBedTilt">
                        <v-btn small style="width: 100%" @click="doSend('BED_TILT_CALIBRATE')">
                            BED TILT CALIBRATE
                        </v-btn>
                    </v-list-item>
                    <v-list-item v-if="existsBedScrews">
                        <v-btn small style="width: 100%" @click="doSend('BED_SCREWS_ADJUST')">BED SCREWS ADJUST</v-btn>
                    </v-list-item>
                    <v-list-item v-if="existsDeltaCalibrate">
                        <v-btn small style="width: 100%" @click="doSend('DELTA_CALIBRATE')">DELTA CALIBRATE</v-btn>
                    </v-list-item>
                    <v-list-item v-if="existsScrewsTilt">
                        <div class="d-flex align-center" style="width: 100%">
                            <v-btn
                                small
                                style="border-top-right-radius: 0; border-bottom-right-radius: 0"
                                @click="doSend('SCREWS_TILT_CALCULATE')">
                                SCREWS TILT CALCULATE
                            </v-btn>
                            <v-menu offset-y left :close-on-content-click="false">
                                <template #activator="{ props }">
                                    <v-btn
                                        small
                                        class="px-0"
                                        style="min-width: 32px; border-top-left-radius: 0; border-bottom-left-radius: 0"
                                        v-bind="props">
                                        <v-icon>{{ mdiMenuDown }}</v-icon>
                                    </v-btn>
                                </template>
                                <v-list dense>
                                    <v-list-item>
                                        <v-btn
                                            small
                                            style="width: 100%"
                                            @click="doSend('SCREWS_TILT_CALCULATE DIRECTION=CW')">
                                            <v-icon left small style="transform: scaleX(-1)">{{ mdiRestore }}</v-icon>
                                            <span>CW</span>
                                        </v-btn>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-btn
                                            small
                                            style="width: 100%"
                                            @click="doSend('SCREWS_TILT_CALCULATE DIRECTION=CCW')">
                                            <v-icon left small>{{ mdiRestore }}</v-icon>
                                            <span>CCW</span>
                                        </v-btn>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </v-list-item>
                </v-list>
            </v-menu>
            <toolhead-panel-settings />
        </template>
        <move-to-control />
        <v-container v-if="axisControlVisible">
            <component :is="`${controlStyle}-control`" />
        </v-container>
        <v-divider v-if="showZOffset" />
        <v-container v-if="showZOffset">
            <zoffset-control />
        </v-container>
        <v-divider v-if="showSpeedFactor" />
        <v-container v-if="showSpeedFactor">
            <tool-slider
                :label="$t('Panels.ToolheadControlPanel.SpeedFactor')"
                :icon="mdiSpeedometer"
                :target="speedFactor"
                :min="1"
                :max="200"
                :multi="100"
                :step="5"
                :dynamic-range="true"
                :has-input-field="true"
                command="M220"
                attribute-name="S" />
        </v-container>
    </panel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import BarsControl from '@/components/panels/ToolheadControls/BarsControl.vue'
import CircleControl from '@/components/panels/ToolheadControls/CircleControl.vue'
import CrossControl from '@/components/panels/ToolheadControls/CrossControl.vue'
import MoveToControl from '@/components/panels/ToolheadControls/MoveToControl.vue'
import Panel from '@/components/ui/Panel.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'
import ZoffsetControl from '@/components/panels/ToolheadControls/ZoffsetControl.vue'
import { mdiDotsVertical, mdiEngineOff, mdiGamepad, mdiSpeedometer, mdiMenuDown, mdiRestore } from '@mdi/js'

const { klipperReadyForGui, printer_state } = useBase()
const { doSend, doZtilt, doQGL, existsZtilt, existsQGL, existsBedTilt, existsBedScrews, existsDeltaCalibrate, existsScrewsTilt } = useControl()

const store = useStore()

const controlStyle = computed(() =>
    store.state.gui.control.style ?? 'bars'
)

const actionButton = computed(() =>
    store.state.gui.control.actionButton ?? store.getters['gui/getDefaultControlActionButton']
)

const speedFactor = computed(() =>
    store.state.printer?.gcode_move?.speed_factor ?? 1
)

const isPrinting = computed(() =>
    ['printing'].includes(printer_state.value)
)

const axisControlVisible = computed(() => {
    if (!showControl.value) return false
    return !(isPrinting.value && (store.state.gui.control.hideDuringPrint ?? false))
})

const showButtons = computed(() => {
    if (controlStyle.value !== 'bars' && (existsZtilt.value || existsQGL.value)) return true
    return existsBedScrews.value || existsBedTilt.value || existsDeltaCalibrate.value || existsScrewsTilt.value
})

const showControl = computed(() =>
    store.state.gui.view.toolhead.showControl ?? true
)

const showZOffset = computed(() =>
    store.state.gui.view.toolhead.showZOffset ?? true
)

const showSpeedFactor = computed(() =>
    store.state.gui.view.toolhead.showSpeedFactor ?? true
)
</script>
