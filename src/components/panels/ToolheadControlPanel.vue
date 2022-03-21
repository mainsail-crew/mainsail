<template>
    <panel
        v-if="klipperReadyForGui"
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
                    <v-list-item></v-list-item>
                </v-list>
            </v-menu>
        </template>
        <move-to-control class="py-0 pt-3"></move-to-control>
        <!-- AXIS CONTROL -->
        <v-container>
            <component :is="`${controlStyle}-control`"></component>
        </v-container>
        <!-- SPEED FACTOR STYLE -->
        <v-divider></v-divider>
        <tool-slider
            :label="$t('Panels.ToolheadControlPanel.SpeedFactor').toString()"
            :icon="mdiSpeedometer"
            :target="speedFactor"
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
import MoveToControl from '@/components/panels/ToolheadControls/MoveToControl.vue'
import Panel from '@/components/ui/Panel.vue'
import ToolSlider from '@/components/inputs/ToolSlider.vue'
import { mdiDotsVertical, mdiGamepad, mdiSpeedometer } from '@mdi/js'

@Component({
    components: {
        BarsControl,
        CircleControl,
        CrossControl,
        MoveToControl,
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

    get speedFactor() {
        return this.$store.state.printer?.gcode_move?.speed_factor ?? 1
    }
}
</script>
