<template>
    <v-container v-if="showEstimatedExtrusion" class="pa-0 ma-0 pb-1">
        <div style="font-size: 0.8em" class="text--disabled text-caption font-weight-light d-flex justify-center">
            <span>
                {{ $t('Panels.ExtruderControlPanel.EstimatedExtrusion') }} ~ {{ extrudedLength }} mm @
                {{ volumetricFlow }} mm³/s -
                <v-icon x-small style="opacity: 0.4; margin-top: -2px">
                    {{ mdiDiameterVariant }}
                </v-icon>
                {{ nozzleDiameter }} mm
            </span>
        </div>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiDiameterVariant } from '@mdi/js'
import ExtruderMixin from '@/components/mixins/extruder'

@Component({})
export default class PressureAdvanceSettings extends Mixins(BaseMixin, ExtruderMixin) {
    mdiDiameterVariant = mdiDiameterVariant

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

    get volumetricFlow(): number {
        return Math.round(Math.pow(this.filamentDiameter / 2, 2) * Math.PI * this.feedrate * 10) / 10
    }
}
</script>
