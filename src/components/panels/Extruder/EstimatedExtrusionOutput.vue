<template>
    <v-container v-if="showEstimatedExtrusion" class="pa-0 ma-0 pb-2">
        <div style="font-size: 0.8em" class="text--disabled text-caption font-weight-light d-flex justify-center">
            <span>
                {{ $t('Panels.ExtruderControlPanel.EstimatedExtrusion') }} ~ {{ extrudedLength }} mm @
                {{ volumetricFlow }} mm³/s -
                <v-icon x-small style="opacity: 0.4; margin-top: -2px">
                    {{ mdiDiameterVariant }}
                </v-icon>
                {{ nozzleDiameter }} mm
                <v-tooltip v-if="showTooltip" top>
                    <template #activator="{ on, attrs }">
                        <v-icon small color="warning" v-bind="attrs" v-on="on">
                            {{ mdiInformationOutline }}
                        </v-icon>
                    </template>
                    <span>
                        <div v-if="speed_factor !== 1">
                            {{ $t('Panels.ToolheadControlPanel.SpeedFactor') }}: {{ speedFactorOutput }} %
                        </div>
                        <div v-if="extrudeFactor !== 1">
                            {{ $t('Panels.ExtruderControlPanel.ExtrusionFactor') }}: {{ extrudeFactorOutput }} %
                        </div>
                    </span>
                </v-tooltip>
            </span>
        </div>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiDiameterVariant, mdiInformationOutline } from '@mdi/js'
import ExtruderMixin from '@/components/mixins/extruder'

@Component({})
export default class PressureAdvanceSettings extends Mixins(BaseMixin, ExtruderMixin) {
    mdiDiameterVariant = mdiDiameterVariant
    mdiInformationOutline = mdiInformationOutline

    get showEstimatedExtrusion() {
        return this.$store.state.gui.control.extruder.showEstimatedExtrusionInfo ?? true
    }

    get extrudedLength(): number {
        return Math.round(
            this.feedamount *
                this.extrudeFactor *
                (Math.pow(this.filamentDiameter, 2) / Math.pow(this.nozzleDiameter, 2))
        )
    }

    get speed_factor() {
        return this.$store.state.printer.gcode_move?.speed_factor ?? 1
    }

    get volumetricFlow(): number {
        return (
            Math.round(Math.pow(this.filamentDiameter / 2, 2) * Math.PI * this.feedrate * this.speed_factor * 10) / 10
        )
    }

    get showTooltip() {
        return this.speed_factor !== 1 || this.extrudeFactor !== 1
    }

    get speedFactorOutput() {
        return (this.speed_factor * 100).toFixed(0)
    }

    get extrudeFactorOutput() {
        return (this.extrudeFactor * 100).toFixed(0)
    }
}
</script>
