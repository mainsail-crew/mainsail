<template>
    <g v-if="hasSyncFeedback">
        <transition name="fade">
            <g v-if="filamentTensionSensor && filamentCompressionSensor" key="neutral">
                <text x="288" y="240">Neutral</text>
                <use xlink:href="#sync-feedback" transform="translate(286, 247.5) scale(1.0,-1.0) rotate(90)" />
            </g>
            <g v-else-if="filamentTensionSensor" key="tension">
                <text x="288" y="240">Tension</text>
                <use xlink:href="#sync-feedback" transform="translate(258, 199) scale(1.2)" />
                <use xlink:href="#sync-feedback" transform="translate(258, 271) scale(1.2,-1.2)" />
            </g>
            <g v-else-if="filamentCompressionSensor" key="compression">
                <text x="288" y="240">Compression</text>
                <use xlink:href="#sync-feedback" transform="translate(258, 235) scale(1.2)" />
                <use xlink:href="#sync-feedback" transform="translate(258, 235) scale(1.2,-1.2)" />
            </g>
        </transition>
    </g>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { FILAMENT_POS_END_BOWDEN } from '@/components/mixins/mmu'

@Component
export default class MmuFilamentStatusSyncFeedback extends Mixins(BaseMixin, MmuMixin) {
    get hasSyncFeedback(): boolean {
        return (
            this.syncFeedbackEnabled &&
            (this.hasFilamentCompressionSensor || this.hasFilamentTensionSensor) &&
            this.mmuFilamentPos >= FILAMENT_POS_END_BOWDEN
        )
    }

    get syncFeedbackEnabled() {
        return this.mmu?.sync_feedback_enabled ?? false
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
