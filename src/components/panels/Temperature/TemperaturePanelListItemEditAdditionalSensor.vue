<template>
    <v-row>
        <v-col class="col-12 py-1">
            <v-checkbox v-model="value" :label="label" hide-details class="mt-0" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class TemperaturePanelListItemEditAdditionalSensor extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: String, required: true }) readonly additionalSensor!: string

    get value() {
        return this.$store.getters['gui/getDatasetAdditionalSensorValue']({
            name: this.objectName,
            type: this.additionalSensor,
        })
    }

    set value(newVal) {
        this.$store.dispatch('gui/setDatasetAdditionalSensorStatus', {
            objectName: this.objectName,
            dataset: this.additionalSensor,
            value: newVal,
        })
    }

    get label() {
        return this.$t('Panels.TemperaturePanel.ShowNameInList', {
            name: this.additionalSensor,
        })
    }
}
</script>
