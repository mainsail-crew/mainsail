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
        const output = []
        let value = this.value?.toFixed(1)
        if (this.value === null) value = '--'

        // get unit
        let unitPrefix: string | null = null
        let unitSuffix: string | null = null

        switch (this.keyName) {
            case 'gas':
                unitPrefix = 'IAQ'
                break
            case 'voc':
                unitPrefix = 'VOC'
                break
        }

        switch (this.keyName) {
            case 'pressure':
                unitSuffix = 'hPa'
                break
            case 'humidity':
                unitSuffix = '%'
                break
            case 'current_z_adjust':
                unitSuffix = 'mm'
                break
        }

        // format value for current_z_adjust
        if (this.keyName === 'current_z_adjust' && this.value) {
            value = this.value.toFixed(3)

            // convert z_adjust value if it is smaller than 0.1 to μm
            if (Math.abs(this.value) < 0.1) {
                value = Math.round(this.value * 1000).toString()
                unitSuffix = 'μm'
            }
        }

        if (['gas', 'voc'].includes(this.keyName) && this.value) {
            value = this.value.toFixed(0)
        }

        if (unitPrefix) output.push(`${unitPrefix}:`)
        output.push(value)
        if (unitSuffix) output.push(unitSuffix)

        return output.join(' ')
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
