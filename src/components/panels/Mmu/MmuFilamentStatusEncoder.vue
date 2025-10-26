<template>
    <g>
        <circle cx="258" cy="140" r="8" stroke-width="1" :class="encoderClass" />
        <path d="M257 135 L261 140 L257 145" stroke-width="2" fill="none" />
        <text x="278" y="145">{{ $t('Panels.MmuPanel.Encoder') }}</text>
        <text x="345" y="145" font-size="11px">{{ encoderPosText }}</text>
        <transition name="fade">
            <text v-if="homedToEncoder" x="219.5" y="145" font-weight="bold">H</text>
        </transition>
    </g>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    DIRECTION_LOAD,
    DIRECTION_UNKNOWN,
    FILAMENT_POS_START_BOWDEN,
    FILAMENT_POS_UNLOADED,
} from '@/components/mixins/mmu'

@Component
export default class MmuFilamentStatusEncoder extends Mixins(BaseMixin, MmuMixin) {
    get encoderClass() {
        // TODO: Need to separate encoder runout disable from general availability (like other sensors)
        if (this.mmuFilamentPos === FILAMENT_POS_UNLOADED) return 'sensor-disabled'

        return this.encoderPos ? 'sensor-triggered' : 'sensor-open'
    }

    get encoderPosText() {
        return this.encoderPos < 10000 ? `${this.encoderPos} mm` : `${this.encoderPos}`
    }

    get filamentDirection() {
        return this.mmu?.filament_direction ?? DIRECTION_UNKNOWN
    }

    get homedToEncoder(): boolean {
        if (this.filamentDirection === DIRECTION_LOAD) {
            return this.configGateHomingEndstop === 'encoder' && this.mmuFilamentPos === FILAMENT_POS_START_BOWDEN
        }

        return this.configGateHomingEndstop === 'encoder' && this.mmuFilamentPos === FILAMENT_POS_START_BOWDEN
    }

    get encoderPos() {
        return Math.round(this.mmuEncoder?.encoder_pos ?? 0)
    }
}
</script>
