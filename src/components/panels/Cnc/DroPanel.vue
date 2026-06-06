<template>
    <panel v-if="klipperReadyForGui" :icon="mdiCrosshairsGps" title="DRO" :collapsible="true" card-class="dro-panel">
        <v-container class="py-2">
            <div class="dro-panel__meta">
                <v-chip small label outlined class="mr-2">{{ coordinateModeLabel }}</v-chip>
                <v-chip small label outlined class="mr-2">Velocity {{ liveVelocity }}</v-chip>
                <v-chip small label outlined :color="allAxesHomed ? 'primary' : 'warning'">
                    {{ allAxesHomed ? 'Homed' : 'Not Homed' }}
                </v-chip>
            </div>

            <div class="dro-panel__axis-grid">
                <section v-for="axis in axes" :key="axis.id" class="dro-panel__axis-card">
                    <div class="dro-panel__axis-header">
                        <span class="dro-panel__axis-name">{{ axis.id }}</span>
                        <v-chip x-small :color="axis.homed ? 'primary' : 'warning'">{{ axis.homed ? 'HOMED' : 'OPEN' }}</v-chip>
                    </div>
                    <div class="dro-panel__axis-section">
                        <span class="dro-panel__label">Machine</span>
                        <span class="dro-panel__value">{{ axis.machine }}</span>
                    </div>
                    <div class="dro-panel__axis-section">
                        <span class="dro-panel__label">Work</span>
                        <span class="dro-panel__value">{{ axis.work }}</span>
                    </div>
                    <div class="dro-panel__axis-section">
                        <span class="dro-panel__label">Offset</span>
                        <span class="dro-panel__offset">{{ axis.offset }}</span>
                    </div>
                    <div class="dro-panel__limit-row">
                        <span class="dro-panel__limit">Min {{ axis.min }}</span>
                        <span class="dro-panel__limit">Max {{ axis.max }}</span>
                    </div>
                </section>
            </div>

            <div class="dro-panel__homed">
                <v-chip small :color="xAxisHomed ? 'primary' : 'warning'" class="mr-2">X {{ xAxisHomed ? 'OK' : '--' }}</v-chip>
                <v-chip small :color="yAxisHomed ? 'primary' : 'warning'" class="mr-2">Y {{ yAxisHomed ? 'OK' : '--' }}</v-chip>
                <v-chip small :color="zAxisHomed ? 'primary' : 'warning'">Z {{ zAxisHomed ? 'OK' : '--' }}</v-chip>
            </div>
        </v-container>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { mdiCrosshairsGps } from '@mdi/js'

@Component({
    components: {
        Panel,
    },
})
export default class DroPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiCrosshairsGps = mdiCrosshairsGps

    get machinePosition() {
        const p = this.$store.state.printer?.motion_report?.live_position ?? [0, 0, 0, 0]
        return { x: p[0] ?? 0, y: p[1] ?? 0, z: p[2] ?? 0 }
    }

    get workPosition() {
        const p = this.$store.state.printer?.gcode_move?.gcode_position ?? [0, 0, 0, 0]
        return { x: p[0] ?? 0, y: p[1] ?? 0, z: p[2] ?? 0 }
    }

    get workOffset() {
        return {
            x: this.machinePosition.x - this.workPosition.x,
            y: this.machinePosition.y - this.workPosition.y,
            z: this.machinePosition.z - this.workPosition.z,
        }
    }

    get axisMinimum() {
        const p = this.$store.state.printer?.toolhead?.axis_minimum ?? [0, 0, 0, 0]
        return { x: p[0] ?? 0, y: p[1] ?? 0, z: p[2] ?? 0 }
    }

    get axisMaximum() {
        const p = this.$store.state.printer?.toolhead?.axis_maximum ?? [0, 0, 0, 0]
        return { x: p[0] ?? 0, y: p[1] ?? 0, z: p[2] ?? 0 }
    }

    get coordinateModeLabel() {
        return this.absolute_coordinates ? 'Absolute (G90)' : 'Relative (G91)'
    }

    get liveVelocity() {
        const v = this.$store.state.printer?.motion_report?.live_velocity ?? 0
        return `${Number(v).toFixed(2)} mm/s`
    }

    get allAxesHomed() {
        return this.xAxisHomed && this.yAxisHomed && this.zAxisHomed
    }

    formatAxis(value: number, digits: number) {
        return Number(value ?? 0).toFixed(digits)
    }

    get machineX() {
        return this.formatAxis(this.machinePosition.x, 2)
    }

    get machineY() {
        return this.formatAxis(this.machinePosition.y, 2)
    }

    get machineZ() {
        return this.formatAxis(this.machinePosition.z, 3)
    }

    get workX() {
        return this.formatAxis(this.workPosition.x, 2)
    }

    get workY() {
        return this.formatAxis(this.workPosition.y, 2)
    }

    get workZ() {
        return this.formatAxis(this.workPosition.z, 3)
    }

    get axes() {
        return [
            {
                id: 'X',
                homed: this.xAxisHomed,
                machine: this.machineX,
                work: this.workX,
                offset: this.formatSigned(this.workOffset.x, 2),
                min: this.formatAxis(this.axisMinimum.x, 2),
                max: this.formatAxis(this.axisMaximum.x, 2),
            },
            {
                id: 'Y',
                homed: this.yAxisHomed,
                machine: this.machineY,
                work: this.workY,
                offset: this.formatSigned(this.workOffset.y, 2),
                min: this.formatAxis(this.axisMinimum.y, 2),
                max: this.formatAxis(this.axisMaximum.y, 2),
            },
            {
                id: 'Z',
                homed: this.zAxisHomed,
                machine: this.machineZ,
                work: this.workZ,
                offset: this.formatSigned(this.workOffset.z, 3),
                min: this.formatAxis(this.axisMinimum.z, 3),
                max: this.formatAxis(this.axisMaximum.z, 3),
            },
        ]
    }

    formatSigned(value: number, digits: number) {
        const output = Number(value ?? 0).toFixed(digits)
        return value > 0 ? `+${output}` : output
    }
}
</script>

<style scoped>
.dro-panel__meta,
.dro-panel__homed {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}

.dro-panel__axis-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin: 0.75rem 0 1rem;
}

.dro-panel__axis-card {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.02);
}

.dro-panel__axis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.85rem;
}

.dro-panel__axis-name {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.08em;
}

.dro-panel__axis-section {
    display: grid;
    gap: 0.2rem;
    margin-bottom: 0.65rem;
}

.dro-panel__label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.68;
}

.dro-panel__value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 1.45rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.dro-panel__offset {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
    opacity: 0.9;
}

.dro-panel__limit-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.3rem;
    margin-top: 0.35rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.dro-panel__limit {
    font-size: 0.78rem;
    opacity: 0.7;
    font-variant-numeric: tabular-nums;
}

@media (max-width: 960px) {
    .dro-panel__axis-grid {
        grid-template-columns: 1fr;
    }
}

@media (min-width: 961px) and (max-width: 1264px) {
    .dro-panel__axis-grid {
        grid-template-columns: 1fr;
    }
}
</style>
