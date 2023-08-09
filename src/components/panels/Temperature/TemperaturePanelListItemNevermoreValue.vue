<template>
    <div v-if="isVisible">
        <v-tooltip top :disabled="disableTooltip">
            <template #activator="{ on, attrs }">
                <span :style="cssStyle" v-bind="attrs" v-on="on">{{ formatValue }}</span>
            </template>
            <span>
                {{ $t('Panels.TemperaturePanel.Max') }}: {{ formatValue_max }}
                <br />
                {{ $t('Panels.TemperaturePanel.Min') }}: {{ formatValue_min }}
            </span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class TemperaturePanelListItemNevermoreValue extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly printerObject!: { [key: string]: number }
    @Prop({ type: String, required: true }) readonly objectName!: string
    @Prop({ type: String, required: true }) readonly keyName!: string
    @Prop({ type: Boolean, required: false, default: true }) readonly small!: boolean

    get cssStyle() {
        let style = { cursor: 'default', fontSize: '1em' }
        if (this.small) style.fontSize = '0.8em'

        return style
    }

    get value() {
        const value = this.printerObject[this.keyName] ?? null
        if (isNaN(value)) return null

        return value
    }

    get intake_value(): number | null {
        const name = `intake_${this.keyName}`

        return this.printerObject[name] ?? null
    }

    get intake_value_min(): number | null {
        const name = `intake_${this.keyName}_min`

        return this.printerObject[name] ?? null
    }

    get intake_value_max(): number | null {
        const name = `intake_${this.keyName}_max`

        return this.printerObject[name] ?? null
    }

    get exhaust_value(): number | null {
        const name = `exhaust_${this.keyName}`

        return this.printerObject[name] ?? null
    }

    get exhaust_value_min(): number | null {
        const name = `exhaust_${this.keyName}_min`

        return this.printerObject[name] ?? null
    }

    get exhaust_value_max(): number | null {
        const name = `exhaust_${this.keyName}_max`

        return this.printerObject[name] ?? null
    }

    get unit(): string | null {
        switch (this.keyName) {
            case 'temperature':
                return '°C'
            case 'pressure':
                return 'hPa'
            case 'humidity':
                return '%'
        }

        return null
    }

    get digits() {
        return ['gas', 'pressure'].includes(this.keyName) ? 0 : 1
    }

    get formatValue() {
        return this.getFormatedValue(this.intake_value, this.exhaust_value)
    }

    get formatValue_min() {
        return this.getFormatedValue(this.intake_value_min, this.exhaust_value_min)
    }

    get formatValue_max() {
        return this.getFormatedValue(this.intake_value_max, this.exhaust_value_max)
    }

    getFormatedValue(intake: number | null, exhaust: number | null): string {
        let intake_value = intake?.toFixed(this.digits)
        let exhaust_value = exhaust?.toFixed(this.digits)
        if (this.intake_value === null) intake_value = '--'
        if (this.exhaust_value === null) exhaust_value = '--'

        // return only the value, if unit is null
        if (this.unit === null) return `${intake_value} > ${exhaust_value}`

        return `${intake_value} ${this.unit} > ${exhaust_value} ${this.unit}`
    }

    get disableTooltip() {
        return (
            this.intake_value_min === null ||
            this.exhaust_value_min === null ||
            this.intake_value_max === null ||
            this.exhaust_value_max === null
        )
    }

    get guiSetting() {
        return this.$store.getters['gui/getDatasetAdditionalSensorValue']({
            name: this.objectName,
            sensor: this.keyName,
        })
    }

    get isVisible() {
        if (this.intake_value === null && this.exhaust_value === null) return false

        return this.guiSetting
    }
}
</script>
