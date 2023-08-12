<template>
    <v-dialog v-model="boolShow" persistent :width="400">
        <panel :title="formatName" :icon="icon" card-class="temperature-edit-heater-dialog" :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text class="pt-6">
                <temperature-panel-list-item-edit-chart-serie
                    v-for="dataset in chartSeries"
                    :key="dataset"
                    :object-name="objectName"
                    :serie-name="dataset" />
                <temperature-panel-list-item-edit-additional-sensor
                    v-for="additionalSensor in additionalValues"
                    :key="additionalSensor"
                    :object-name="objectName"
                    :additional-sensor="additionalSensor" />
                <v-row>
                    <v-col class="col-12 text-center pb-0">
                        <v-color-picker
                            hide-mode-switch
                            mode="hexa"
                            :value="color"
                            class="mx-auto"
                            @update:color="setChartColor" />
                    </v-col>
                </v-row>
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCloseThick } from '@mdi/js'
import TemperaturePanelListItemEditChartSerie from '@/components/panels/Temperature/TemperaturePanelListItemEditChartSerie.vue'
import TemperaturePanelListItemEditAdditionalSensor from '@/components/panels/Temperature/TemperaturePanelListItemEditAdditionalSensor.vue'
import { Debounce } from 'vue-debounce-decorator'

@Component({
    components: { TemperaturePanelListItemEditAdditionalSensor, TemperaturePanelListItemEditChartSerie },
})
export default class TemperaturePanelListItemEdit extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, required: true }) readonly boolShow!: boolean
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: String, required: true }) readonly name!: string
    @Prop({ required: true }) readonly additionalSensorName!: string | null
    @Prop({ type: String, required: true }) readonly formatName!: string
    @Prop({ type: String, required: true }) readonly icon!: string
    @Prop({ type: String, required: true }) readonly color!: string

    get chartSeries() {
        return this.$store.getters['printer/tempHistory/getSerieNames'](this.objectName) ?? []
    }

    get printerObjectAdditionalSensor() {
        if (this.additionalSensorName === null || !(this.additionalSensorName in this.$store.state.printer)) return {}

        return this.$store.state.printer[this.additionalSensorName]
    }

    get additionalValues() {
        if (this.objectName === 'z_thermal_adjust') return ['current_z_adjust']
        if (this.objectName === 'nevermore') return ['temperature', 'pressure', 'humidity', 'rpm']

        return Object.keys(this.printerObjectAdditionalSensor).filter((key) => key !== 'temperature')
    }

    @Debounce(500)
    setChartColor(value: string | any): void {
        if (typeof value === 'object' && 'hex' in value) value = value.hex

        this.$store.dispatch('gui/setChartColor', {
            objectName: this.objectName,
            value,
        })

        this.$store.dispatch('printer/tempHistory/setColor', { name: this.objectName, value })
    }

    closeDialog() {
        this.$emit('close-dialog')
    }
}
</script>
