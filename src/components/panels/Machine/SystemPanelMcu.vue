<template>
    <v-row class="py-0 flex-nowrap">
        <v-col class="pl-6 pr-0 d-flex flex-column max-width-content">
            <div class="d-flex">
                <strong class="cursor-pointer" @click="mcuDetailsDialog = true">{{ name }}</strong>
                <small v-if="chip" class="ml-2">({{ chip }})</small>
            </div>
            <div class="text-body-2 d-flex flex-column">
                <div class="text-truncate">{{ $t('Machine.SystemPanel.Values.Version', { version }) }}</div>
                <div v-if="additionalInfos.length" class="d-flex flex-wrap">
                    <div v-for="(info, index) in additionalInfos" :key="index">
                        <v-tooltip :disabled="!info.tooltip" top>
                            <template #activator="{ on, attrs }">
                                <span v-bind="attrs" class="text-no-wrap" v-on="on" v-text="info.text" />
                                <span v-if="index < additionalInfos.length - 1" class="mr-1">,</span>
                            </template>
                            <span v-html="info.tooltip" />
                        </v-tooltip>
                    </div>
                </div>
            </div>
        </v-col>
        <v-col class="pl-2 pr-6 col-auto d-flex justify-center align-center">
            <v-progress-circular :rotate="-90" :size="55" :width="7" :value="loadPercent" :color="loadColor">
                {{ loadPercent }}
            </v-progress-circular>
        </v-col>
        <SystemPanelMcuDialog :name="name" :show="mcuDetailsDialog" @close="mcuDetailsDialog = false" />
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { formatFilesize, formatFrequency } from '@/plugins/helpers'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class SystemPanelMcu extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize
    mdiCloseThick = mdiCloseThick

    mcuDetailsDialog = false

    @Prop({ required: true, type: String }) readonly name!: string

    get mcu() {
        return this.$store.state.printer[this.name]
    }

    get mcuName() {
        return this.name.split(' ')[1] ?? 'mcu'
    }

    get version() {
        const version = (this.mcu.mcu_version ?? 'unknown').split('-').slice(0, 4).join('-')
        const app = this.mcu.app ?? 'Klipper'

        if (app !== 'Klipper') return `${app} ${version}`

        return version
    }

    get chip() {
        return this.mcu.mcu_constants?.MCU ?? null
    }

    get load() {
        const mcu_task_avg = this.mcu.last_stats?.mcu_task_avg
        const mcud_task_stddev = this.mcu.last_stats?.mcu_task_stddev

        if (!mcu_task_avg || !mcud_task_stddev) return 0

        return (mcu_task_avg + (3 * mcud_task_stddev) / 0.0025).toFixed(2)
    }

    get loadPercent() {
        if (this.load > 1) return 100

        return Math.round(this.load * 100)
    }

    get loadColor() {
        if (this.load > 0.95) return 'error'
        if (this.load > 0.8) return 'warning'

        return 'primary'
    }

    get awake() {
        const awake = this.mcu.last_stats?.mcu_awake ?? 0

        return (awake / 5).toFixed(2)
    }

    get freq() {
        return this.mcu.last_stats?.freq ?? null
    }

    get freqFormat() {
        if (this.freq === null) return null

        return formatFrequency(this.freq)
    }

    get tempSensor() {
        const validSensorTypes = ['temperature_sensor', 'temperature_fan']

        const sensorName = Object.keys(this.$store.state.printer).find((name) => {
            const type = name.split(' ')[0]

            if (!validSensorTypes.includes(type)) return false
            const printerSettings = this.$store.state.printer.configfile?.settings ?? {}
            const settings = printerSettings[name.toLowerCase()] ?? {}

            const sensorType = settings.sensor_type ?? ''
            if (sensorType !== 'temperature_mcu') return false
            const sensorMcu = settings.sensor_mcu ?? 'mcu'

            return sensorMcu === this.mcuName
        })

        if (!sensorName) return null

        return this.$store.state.printer[sensorName]
    }

    get temperature() {
        const value = this.tempSensor?.temperature ?? null

        if (value === null) return null

        return value.toFixed(1)
    }

    get measuredMinTemp() {
        const value = this.tempSensor?.measured_min_temp ?? null

        return value !== null ? value.toFixed(1) : null
    }

    get measuredMaxTemp() {
        const value = this.tempSensor?.measured_max_temp ?? null

        return value !== null ? value.toFixed(1) : null
    }

    get additionalInfos() {
        const output: { text: string; tooltip?: string }[] = []

        output.push({ text: this.$t('Machine.SystemPanel.Values.Load', { load: this.load }).toString() })
        output.push({ text: this.$t('Machine.SystemPanel.Values.Awake', { awake: this.awake }).toString() })

        if (this.freq) {
            output.push({
                text: this.$t('Machine.SystemPanel.Values.Frequency', { frequency: this.freqFormat }).toString(),
            })
        }

        if (this.tempSensor) {
            output.push({
                text: this.$t('Machine.SystemPanel.Values.Temp', { temp: this.temperature }).toString(),
                tooltip:
                    this.$t('Machine.SystemPanel.Values.TempMax', { temp: this.measuredMaxTemp }).toString() +
                    '<br />' +
                    this.$t('Machine.SystemPanel.Values.TempMin', { temp: this.measuredMinTemp }).toString(),
            })
        }

        return output
    }
}
</script>

<style scoped>
.max-width-content {
    /* 87px is the width of the progress circle */
    max-width: calc(100% - 87px);
}
</style>
