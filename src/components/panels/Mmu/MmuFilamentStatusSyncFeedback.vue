<template>
    <g v-if="hasSyncFeedback">
        <use
            xlink:href="#sync-feedback-buffer-piston"
            :style="{
                transform: `translate(232px, ${syncFeedbackPistonPos}px)`,
                transition: 'transform 250ms ease',
            }" />
        <use xlink:href="#sync-feedback-buffer-box" transform="translate(232, 212)" />
        <g v-if="syncFeedbackActive">
            <transition name="fade">
                <g v-if="filamentTensionSensor && filamentCompressionSensor" key="neutral">
                    <text x="298" y="240">Neutral</text>
                    <use xlink:href="#sync-feedback" transform="translate(296, 247.5) scale(1.0,-1.0) rotate(90)" />
                </g>
                <g v-else-if="filamentTensionSensor" key="tension">
                    <text x="298" y="240">Tension</text>
                    <use xlink:href="#sync-feedback" transform="translate(272, 199) scale(1.2)" />
                    <use xlink:href="#sync-feedback" transform="translate(272, 271) scale(1.2,-1.2)" />
                </g>
                <g v-else-if="filamentCompressionSensor" key="compression">
                    <text x="298" y="240">Compression</text>
                    <use xlink:href="#sync-feedback" transform="translate(272, 235) scale(1.2)" />
                    <use xlink:href="#sync-feedback" transform="translate(272, 235) scale(1.2,-1.2)" />
                </g>
            </transition>
        </g>
    </g>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { FILAMENT_POS_END_BOWDEN } from '@/components/mixins/mmu'

@Component
export default class MmuFilamentStatusSyncFeedback extends Mixins(BaseMixin, MmuMixin) {
    get hasSyncFeedback(): boolean {
        return this.hasFilamentCompressionSensor || this.hasFilamentTensionSensor || this.hasFilamentProportionalSensor
    }

    get syncFeedbackActive(): boolean {
        const enabled = this.mmu?.sync_feedback_enabled ?? false
        const loaded = this.mmuFilamentPos >= FILAMENT_POS_END_BOWDEN
        return this.hasSyncFeedback && enabled && loaded
    }

    get syncFeedbackBiasModelled() {
        return this.mmu?.sync_feedback_bias_modelled ?? 0.0
    }

    get syncFeedbackPistonPos(): int {
        const yPos = this.syncFeedbackBiasModelled * 12 + 234
        return yPos
    }

    get hasFilamentProportionalSensor() {
        return this.hasMmuSensor('filament_proportional')
    }

    get hasFilamentCompressionSensor() {
        return this.hasMmuSensor('filament_compression')
    }

    get hasFilamentTensionSensor() {
        return this.hasMmuSensor('filament_tension')
    }

    get filamentCompressionSensor() {
        return this.getMmuSensor('filament_compression')
    }

    get filamentTensionSensor() {
        return this.getMmuSensor('filament_tension')
    }
}
</script>

<style scoped>
text {
    fill: currentColor;
}
</style>
