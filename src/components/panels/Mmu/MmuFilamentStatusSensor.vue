<template>
    <g v-if="hasSensor">
        <circle cx="258" :cy="yPosition" r="8" stroke-width="1" :class="circleClass" />
        <text x="278" :y="yPosition + 5" :class="textClass">{{ sensorText }}</text>
        <transition name="fade">
            <text v-if="homedTo" x="219.5" :y="yPosition + 5" font-weight="bold">H</text>
        </transition>
    </g>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    FILAMENT_POS_HOMED_ENTRY,
    FILAMENT_POS_HOMED_GATE,
    FILAMENT_POS_HOMED_TS,
    Mmu,
} from '@/components/mixins/mmu'

@Component
export default class MmuFilamentStatusSensor extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly sensorName!: keyof Mmu['sensors']
    @Prop({ required: true }) readonly sensorText!: string
    @Prop({ required: true }) readonly yPosition!: number
    @Prop({ default: false }) readonly outsideZone!: boolean

    get hasSensor() {
        return this.hasMmuSensor(this.sensorName)
    }

    get sensorStatus() {
        return this.getMmuSensor(this.sensorName)
    }

    get circleClass() {
        return {
            'sensor-disabled': this.sensorStatus === null,
            'sensor-triggered': this.sensorStatus === true,
            'sensor-open': this.sensorStatus === false,
            'outside-zone': this.outsideZone,
        }
    }

    get textClass() {
        return {
            'text-disabled': this.sensorStatus === null,
        }
    }

    get homedTo() {
        if (this.sensorName === 'extruder') return this.mmuFilamentPos === FILAMENT_POS_HOMED_ENTRY
        if (this.sensorName === 'toolhead') return this.mmuFilamentPos === FILAMENT_POS_HOMED_TS

        if (!['mmu_gear', 'mmu_gate'].includes(this.sensorName)) return false

        return this.configGateHomingEndstop === this.sensorName && this.mmuFilamentPos === FILAMENT_POS_HOMED_GATE
    }
}
</script>

<style scoped>
text {
    fill: currentColor;
}

.text-disabled {
    opacity: 0.5;
}

.sensor-triggered {
    fill: limegreen;
}

.sensor-disabled {
    stroke: var(--disabled-stroke);
    stroke-dasharray: 2, 1;
    fill: var(--zone-background-dark-theme);
}

html.theme--light .sensor-disabled {
    fill: var(--zone-background-light-theme);
}

.sensor-open {
    fill: var(--zone-background-dark-theme);
}

html.theme--light .sensor-open {
    fill: var(--zone-background-light-theme);
}

.sensor-disabled.outside-zone {
    fill: var(--background-dark-theme);
}

html.theme--light .sensor-disabled.outside-zone {
    fill: var(--background-light-theme);
}

.sensor-open.outside-zone {
    fill: var(--background-dark-theme);
}

html.theme--light .sensor-open.outside-zone {
    fill: var(--background-light-theme);
}
</style>
