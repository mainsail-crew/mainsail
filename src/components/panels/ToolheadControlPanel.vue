<template>
    <panel
        v-if="klipperReadyForGui && ['standby', 'paused', 'complete', 'cancelled', 'error'].includes(printer_state)"
        :icon="mdiGamepad"
        :title="$t('Panels.ToolheadControlPanel.Headline').toString()"
        :collapsible="true"
        card-class="toolhead-control-panel">
        <!-- PANEL-HEADER 3-DOT-MENU -->
        <template #buttons>
            <v-menu left :offset-y="true" :close-on-content-click="false" class="pa-0">
                <template #activator="{ on, attrs }">
                    <v-btn icon tile v-bind="attrs" v-on="on">
                        <v-icon>{{ mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <v-list-item>Fancy button goes in here!</v-list-item>
                    <v-list-item>And here too!</v-list-item>
                </v-list>
            </v-menu>
        </template>
        <!-- AXIS CONTROL STYLE -->
        <v-container>
            <component :is="`${controlStyle}-control`"></component>
        </v-container>
        <!-- SPEED FACTOR STYLE -->
        <v-divider></v-divider>
        <tool-slider
            :label="$t('Panels.PrintsettingsPanel.SpeedFactor').toString()"
            :icon="mdiSpeedometer"
            :target="speed_factor"
            :min="1"
            :max="200"
            :multi="100"
            :step="5"
            :dynamic-range="true"
            :has-input-field="true"
            command="M220"
            attribute-name="S"></tool-slider>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BarsControl from '@/components/panels/ToolheadControls/BarsControl.vue'
import BaseMixin from '../mixins/base'
import CircleControl from '@/components/panels/ToolheadControls/CircleControl.vue'
import CrossControl from '@/components/panels/ToolheadControls/CrossControl.vue'
import Panel from '@/components/ui/Panel.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'
import { mdiDotsVertical, mdiGamepad, mdiSpeedometer } from '@mdi/js'

@Component({
    components: {
        BarsControl,
        CircleControl,
        CrossControl,
        Panel,
        ToolSlider,
    },
})
export default class ToolheadControlPanel extends Mixins(BaseMixin) {
    mdiDotsVertical = mdiDotsVertical
    mdiGamepad = mdiGamepad
    mdiSpeedometer = mdiSpeedometer

    get controlStyle() {
        return this.$store.state.gui.control.style ?? 'bars'
    }

    get speed_factor() {
        return this.$store.state.printer?.gcode_move?.speed_factor ?? 1
    }
}
</script>
