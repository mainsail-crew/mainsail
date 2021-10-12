<style scoped>
    .coordinate >>> .v-input__slot {
        min-height: 36px !important;
    }
</style>

<template>
    <v-text-field
        class="coordinate"
        v-model="coordinate"
        :prefix="label"
        @change="changed"
        @keyup="changed"
        outlined
        hide-details
        :rules="nameRules"
        dense
    ></v-text-field>
</template>

<script lang="ts">
import {Component, Mixins, Prop, VModel} from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class CoordinateNumberInput extends Mixins(BaseMixin) {
    @VModel({ type: String }) coordinate!: string

    @Prop({ type: Number, required: true }) readonly maxValue!: number
    @Prop({ type: Number, required: true }) readonly minValue!: number
    @Prop({ type: String, required: true }) readonly label!: string

    nameRules = [
        (v: string) => v === '' || this.isInRange(parseFloat(v)) || 'Out of range',
    ]

    private isInRange(value: number): boolean {
        return value <= this.maxValue && value >= this.minValue
    }

    changed() {
        if (!this.coordinate.match(/^-?(\d+(\.|,)?\d*)?$/)) {
            const parsed = parseFloat(this.coordinate)
            if (!isNaN(parsed)) {
                this.coordinate = parsed.toString()
            } else {
                this.coordinate = ''
            }
        }
    }

}
</script>
