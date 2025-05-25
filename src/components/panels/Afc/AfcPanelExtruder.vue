<template>
    <div class="rounded-lg grey darken-3 mt-3">
        <v-row>
            <v-col class="pl-6 py-1">
                <v-tooltip top>
                    <template #activator="{ on, attr }">
                        <span
                            v-bind="attr"
                            class="sensor-status rounded-circle d-inline-block mr-2"
                            :class="preSensorClasses"
                            v-on="on" />
                    </template>
                    <span>{{ preSensorOutput }}</span>
                </v-tooltip>
                <span>{{ name }}</span>
                <v-tooltip v-if="hasPostSensor" top>
                    <template #activator="{ on, attr }">
                        <span
                            v-bind="attr"
                            class="sensor-status rounded-circle d-inline-block ml-2"
                            :class="postSensorClasses"
                            v-on="on" />
                    </template>
                    <span>{{ postSensorOutput }}</span>
                </v-tooltip>
            </v-col>
            <v-col class="py-1">bla</v-col>
        </v-row>
    </div>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'

@Component
export default class AfcPanelExtruder extends Mixins(BaseMixin, AfcMixin) {
    @Prop({ type: String, required: true }) readonly name!: string

    get afcExtruder() {
        const printer = this.$store.state.printer ?? {}
        const name = `AFC_extruder ${this.name}`

        return printer[name] ?? {}
    }

    get settings() {
        const settings = this.$store.state.printer.configfile?.settings ?? {}
        const key = `AFC_extruder ${this.name}`.toLowerCase()

        return settings[key] ?? {}
    }

    get useRamming() {
        const toolStart = this.afcExtruder.tool_start ?? ''

        return toolStart === 'buffer'
    }

    get hasActiveLane() {
        const lanes = this.afcExtruder.lanes ?? []

        return lanes.includes(this.afcCurrentLoad)
    }

    get rammingState() {
        if (!this.useRamming || !this.hasActiveLane) return false

        return true
    }

    get laneLoaded() {
        return this.afcExtruder.lane_loaded ?? ''
    }

    get preSensorStatus() {
        return this.afcExtruder.tool_start_status ?? false
    }

    get preSensorClasses() {
        if (this.useRamming) {
            return {
                success: !this.laneLoaded,
                error: !this.laneLoaded,
                'grey lighten4': this.laneLoaded,
            }
        }

        return {
            success: this.preSensorStatus,
            error: !this.preSensorStatus,
        }
    }

    get preSensorOutput() {
        if (this.useRamming) {
            if (this.laneLoaded) return `${this.$t('Panels.AfcPanel.RammingSensor')}`

            const status = this.rammingState ? this.$t('Panels.AfcPanel.Detected') : this.$t('Panels.AfcPanel.Empty')
            return `${this.$t('Panels.AfcPanel.RammingSensor')} - ${status}`
        }

        const status = this.preSensorStatus ? this.$t('Panels.AfcPanel.Detected') : this.$t('Panels.AfcPanel.Empty')

        return `${this.$t('Panels.AfcPanel.PreExtruderSensor')} - ${status}`
    }

    get hasPostSensor() {
        return 'pin_tool_end' in this.settings
    }

    get postSensorStatus() {
        return this.afcExtruder.tool_end_status ?? false
    }

    get postSensorClasses() {
        return {
            success: this.postSensorStatus,
            error: !this.postSensorStatus,
        }
    }

    get postSensorOutput() {
        const status = this.postSensorStatus ? this.$t('Panels.AfcPanel.Detected') : this.$t('Panels.AfcPanel.Empty')

        return `${this.$t('Panels.AfcPanel.PostExtruderSensor')} - ${status}`
    }
}
</script>

<style scoped>
.sensor-status {
    width: 10px;
    height: 10px;
}
</style>
