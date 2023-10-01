<template>
    <div v-if="isVisible">
        <small>{{ formatValue }}</small>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class TemperaturePanelListItemAdditionalSensorValue extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly printerObject!: { [key: string]: number }
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: String, required: true }) readonly keyName!: string

    get value() {
        const value = this.printerObject[this.keyName] ?? null
        if (isNaN(value)) return null

        return value
    }

    get formatValue() {
        let value = this.value?.toFixed(1)
        if (this.value === null) value = '--'

        // get unit
        let unit: string | null = null
        switch (this.keyName) {
            case 'pressure':
                unit = 'hPa'
                break
            case 'humidity':
                unit = '%'
                break
            case 'current_z_adjust':
                unit = 'mm'
                break
        }

        // format value for current_z_adjust
        if (this.keyName === 'current_z_adjust' && this.value) {
            value = this.value.toFixed(3)

            // convert z_adjust value if it is smaller than 0.1 to μm
            if (Math.abs(this.value) < 0.1) {
                value = Math.round(this.value * 1000).toString()
                unit = 'μm'
            }
        }

        return unit ? `${value} ${unit}` : value
    }

    get guiSetting() {
        return this.$store.getters['gui/getDatasetAdditionalSensorValue']({
            name: this.objectName,
            sensor: this.keyName,
        })
    }

    get isVisible() {
        if (this.value === null) return false

        return this.guiSetting
    }
}
</script>
