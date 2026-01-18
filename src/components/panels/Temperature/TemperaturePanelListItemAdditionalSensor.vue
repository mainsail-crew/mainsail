<template>
    <div>
        <temperature-panel-list-item-additional-sensor-value
            v-for="keyName of additionalValues"
            :key="keyName"
            :printer-object="printerObject"
            :object-name="objectName"
            :sensor-type="sensorType"
            :key-name="keyName" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class TemperaturePanelListItemAdditionalSensor extends Mixins(BaseMixin) {
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: String, required: true }) readonly additionalObjectName!: string

    get printerObject() {
        if (!(this.additionalObjectName in this.$store.state.printer)) return {}

        return this.$store.state.printer[this.additionalObjectName]
    }

    get additionalValues() {
        if (this.objectName === 'z_thermal_adjust') return ['current_z_adjust']

        return Object.keys(this.printerObject).filter((key) => key !== 'temperature')
    }

    get sensorType() {
        return this.additionalObjectName.split(' ')[0]
    }
}
</script>
