<template>
    <g>
        <circle cx="258" cy="140" r="8" stroke-width="1" :class="encoderClass" />
        <path d="M257 135 L261 140 L257 145" stroke-width="2" fill="none" />
        <text x="278" y="145" :class="textClass">{{ $t('Panels.MmuPanel.Encoder') }}</text>
        <text x="345" y="145" :class="textClass" font-size="11px">{{ encoderPosText }}</text>
        <transition name="fade">
            <text v-if="homedToEncoder" x="219.5" y="145" font-weight="bold">H</text>
        </transition>
    </g>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { DIRECTION_LOAD, DIRECTION_UNKNOWN, FILAMENT_POS_START_BOWDEN } from '@/components/mixins/mmu'

@Component
export default class MmuFilamentStatusEncoder extends Mixins(BaseMixin, MmuMixin) {
    get encoderClass() {
        return this.mmuEncoder?.enabled ? 'sensor-normal' : 'sensor-disabled'
    }

    get textClass() {
        return {
            'text-disabled': !this.mmuEncoder?.enabled,
        }
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

<style scoped>
text {
    fill: currentColor;
}

.sensor-disabled {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--zone-background-dark-theme);
}

html.theme--light .sensor-disabled {
    fill: var(--zone-background-light-theme);
}

.sensor-normal {
    fill: var(--zone-background-dark-theme);
}

html.theme--light .sensor-normal {
    fill: var(--zone-background-light-theme);
}
</style>
