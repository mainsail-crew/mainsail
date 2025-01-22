<template>
    <div :class="['extruder-item', { active: toolActive }]">
        <div class="extruder-container">
            <div v-if="!tool.ramming" class="left-section">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <span
                            v-bind="attrs"
                            :class="{
                                'status-light': true,
                                success: tool.tool_start_status,
                                error: !tool.tool_start_status,
                            }"
                            v-on="on"></span>
                    </template>
                    <span>{{ preSensorStatus }}</span>
                </v-tooltip>
                <span class="tool-name">{{ tool.name }}</span>
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <span
                            v-if="tool.has_end_sensor"
                            v-bind="attrs"
                            :class="{
                                'status-light': true,
                                success: tool.tool_end_status,
                                error: !tool.tool_end_status,
                            }"
                            v-on="on"></span>
                    </template>
                    <span>{{ postSensorStatus }}</span>
                </v-tooltip>
            </div>
            <div v-else class="left-section">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <span
                            v-bind="attrs"
                            :class="{
                                'status-light': true,
                                'disabled--text': true,
                                success: rammingState && !tool.lane_loaded,
                                error: !rammingState && !tool.lane_loaded,
                                disabled: tool.lane_loaded,
                            }"
                            v-on="on"></span>
                    </template>
                    <span>{{ rammingSensorStatus }}</span>
                </v-tooltip>
                <span class="tool-name">{{ tool.name }}</span>
            </div>
            <div class="buffer-info">{{ getToolInfo().buffer }}</div>
            <div class="lane-status">
                {{ getToolInfo().state }} :
                <span :class="tool.lane_loaded !== '' ? 'primary--text' : 'error--text'">
                    {{ getToolInfo().lane }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { Extruder, Lane } from '@/store/server/afc/types'
import ControlMixin from '@/components/mixins/control'

@Component({})
export default class AfcExtruderToolsItem extends Mixins(BaseMixin, ControlMixin) {
    @Prop({ type: Object, required: true }) readonly tool!: Extruder

    toolActive = false

    get currentLane(): Lane {
        return this.$store.getters['server/afc/getCurrentLane']
    }

    get currentLoad(): Lane {
        return this.$store.getters['server/afc/getCurrentLoad']
    }

    get getCurrentState(): string {
        return this.$store.getters['server/afc/getCurrentState']
    }

    get rammingState(): boolean {
        if (this.currentLoad && this.currentLoad.extruder.name === this.tool.name) {
            return this.currentLoad.buffer.state.toLowerCase() === 'trailing'
        } else if (this.currentLane && this.currentLane.extruder.name === this.tool.name) {
            return this.currentLane.buffer.state.toLowerCase() === 'trailing'
        } else {
            return false
        }
    }

    getToolInfo() {
        let state = `${this.$t('Panels.AfcPanel.Idle')}`
        let lane = `${this.$t('Panels.AfcPanel.LaneLoadedNone')}`
        let buffer = `${this.$t('Panels.AfcPanel.BufferDisabled')}`

        if (this.currentLoad && this.currentLoad.extruder.name === this.tool.name) {
            if (this.printerIsPrintingOnly) {
                state = `${this.$t('Panels.AfcPanel.Printing')}`
            } else {
                state = `${this.$t(`Panels.AfcPanel.${this.getCurrentState}`)}`
            }
            lane = `${this.currentLoad.name}`
            buffer = `${this.currentLoad.buffer.name}: ${this.currentLoad.buffer.state}`
            this.toolActive = true
        } else if (this.currentLane && this.currentLane.extruder.name === this.tool.name) {
            state = `${this.$t(`Panels.AfcPanel.${this.getCurrentState}`)}`
            lane = `${this.currentLane.name}`
            buffer = `${this.currentLane.buffer.name}: ${this.currentLane.buffer.state}`
            this.toolActive = true
        } else if (this.tool.lane_loaded) {
            state = `${this.$t('Panels.AfcPanel.Idle')}`
            lane = `${this.tool.lane_loaded}`
            buffer = ``
            this.toolActive = false
        }

        return { state, lane, buffer }
    }

    get preSensorStatus(): string {
        const status = this.tool.tool_start_status
            ? this.$t('Panels.AfcPanel.Detected')
            : this.$t('Panels.AfcPanel.Empty')
        return `${this.$t('Panels.AfcPanel.PreExtruderSensor')} - ${status}`
    }

    get postSensorStatus(): string {
        const status = this.tool.tool_end_status
            ? this.$t('Panels.AfcPanel.Detected')
            : this.$t('Panels.AfcPanel.Empty')
        return `${this.$t('Panels.AfcPanel.PostExtruderSensor')} - ${status}`
    }

    get rammingSensorStatus(): string {
        if (this.tool.lane_loaded) {
            return `${this.$t('Panels.AfcPanel.RammingSensor')}`
        } else {
            const status = this.rammingState ? this.$t('Panels.AfcPanel.Detected') : this.$t('Panels.AfcPanel.Empty')
            return `${this.$t('Panels.AfcPanel.RammingSensor')} - ${status}`
        }
    }
}
</script>

<style scoped>
.extruder-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
}

.left-section {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
    flex-shrink: 0;
}

.tool-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
}

.buffer-info {
    text-align: center;
    flex: 1 0;
    min-width: 120px;
}

.lane-status {
    text-align: right;
    min-width: 120px;
    max-width: 130px;
    flex: 1;
}

.status-light {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin: 0 5px;
}

.active {
    border: 1px solid var(--v-primary-base);
}

.disabled {
    background-color: var(--v-secondary-lighten4) !important;
    border-color: var(--v-secondary-lighten4) !important;
}
</style>
