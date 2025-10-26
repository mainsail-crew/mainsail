<template>
    <text x="228" y="412" font-size="11px" font-weight="bold" text-anchor="end" :class="temperatureClass">
        {{ temperatureText }}
    </text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'

@Component
export default class MmuFilamentStatusTemperature extends Mixins(BaseMixin, MmuMixin) {
    get temperatureClass() {
        const canExtrude = this.$store.state.printer.extruder?.can_extrude ?? false

        return {
            'text-disabled': !canExtrude,
        }
    }

    get temperatureText() {
        const extTemp = this.$store.state.printer.extruder?.temperature ?? null

        return extTemp ? `${extTemp.toFixed(0)}°C` : ''
    }
}
</script>
