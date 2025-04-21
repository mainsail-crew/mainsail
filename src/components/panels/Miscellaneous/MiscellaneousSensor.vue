<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_miscellaneous-sensor-subheader">
                    <v-icon small class="mr-2">{{ unitToSymbol(unit) }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer />
                    <span>{{ output }}</span>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName, unitToSymbol } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import {} from '@mdi/js'

@Component()
export default class MiscellaneousSensor extends Mixins(BaseMixin) {
    convertName = convertName
    unitToSymbol = unitToSymbol

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Number, required: true }) declare readonly value: number
    @Prop({ type: String, required: false }) declare readonly unit: string

    get output() {
        const value = isNaN(this.value) ? '--' : this.value

        if (this.unit === null) return this.value

        return `${value} ${this.unit}`
    }
}
</script>

<style scoped>
._miscellaneous-sensor-subheader {
    height: auto;
}
</style>
