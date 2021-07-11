<style scoped>
    .cursor--pointer {
        cursor: pointer;
    }
</style>

<template>
    <div>
        <v-card class="mb-6">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>{{ $t('Machine.SystemPanel.SystemLoad') }}</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="px-0 py-2">
                <div v-for="(mcu, key, index) of mcus" v-bind:key="key">
                    <v-divider class="my-2" v-if="index" ></v-divider>
                    <v-row class="py-0">
                        <v-col class="pl-6">
                            <strong @click="openMcuDetails(key, mcu)" style="cursor: pointer;">{{ key }}</strong><small v-if="mcuChip(mcu)" class="ml-2">({{ mcuChip(mcu) }})</small><br />
                            {{ mcuVersion(mcu) }}<br />
                            {{ $t('Machine.SystemPanel.Load') }}: {{ mcuLoad(mcu).toFixed(2) }},
                            {{ $t('Machine.SystemPanel.Awake') }}: {{ mcuAwake(mcu).toFixed(2) }}
                            <span v-if="mcuFrequency(mcu)">, {{ $t('Machine.SystemPanel.Frequency') }}: {{ mcuFrequency(mcu) }}</span>
                            <template v-if="mcuTempSensor(key)">
                                <span>, </span>
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">Temp: {{ 'temperature' in mcuTempSensor(key) ? mcuTempSensor(key).temperature.toFixed(0)+"°C" : "--" }}</span>
                                    </template>
                                    <span v-if="'measured_min_temp' in mcuTempSensor(key) && 'measured_max_temp' in mcuTempSensor(key)">
                                        max: {{ mcuTempSensor(key).measured_max_temp.toFixed(0) }}°C<br />
                                        min: {{ mcuTempSensor(key).measured_min_temp.toFixed(0) }}°C
                                    </span>
                                </v-tooltip>
                            </template>
                        </v-col>
                        <v-col class="px-6 col-auto d-flex justify-end align-center">
                            <v-progress-circular
                                :rotate="-90"
                                :size="55"
                                :width="7"
                                :value="mcuLoadPercent(mcu).toFixed(0)"
                                :color="convertProgressColor(mcuLoadPercent(mcu).toFixed(0))"
                            >
                                {{ mcuLoadPercent(mcu).toFixed(0) }}
                            </v-progress-circular>
                        </v-col>
                    </v-row>
                </div>
                <div v-if="systemStats">
                    <v-divider class="my-2" v-if="Object.keys(mcus).length" ></v-divider>
                    <v-row class="py-0">
                        <v-col class="pl-6">
                            <strong style="cursor: pointer;" @click="hostDetailsDialog.bool = true">Host</strong>
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <small v-if="hostCpuName" class="ml-2" v-bind="attrs" v-on="on">({{ hostCpuName }})</small>
                                </template>
                                <span v-if="'cpu_info' in systemInfo && 'cpu_desc' in systemInfo.cpu_info">{{ system_info.cpu_info.cpu_desc }}</span>
                            </v-tooltip>
                            <br />
                            <span v-if="systemVersion">{{ systemVersion }}<br /></span>
                            <span>{{ $t('Machine.SystemPanel.Load') }}: {{ hostLoad.toFixed(2) }}</span>
                            <span>, {{ $t('Machine.SystemPanel.Memory') }}: {{ formatFilesize(memavail) }}</span>
                            <template v-if="hostTempSensor">
                                <span>, </span>
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span v-bind="attrs" v-on="on">Temp: {{ 'temperature' in hostTempSensor ? hostTempSensor.temperature.toFixed(0)+"°C" : "--" }}</span>
                                    </template>
                                    <span v-if="'measured_min_temp' in hostTempSensor && 'measured_max_temp' in hostTempSensor">
                                        max: {{ hostTempSensor.measured_max_temp.toFixed(0) }}°C<br />
                                        min: {{ hostTempSensor.measured_min_temp.toFixed(0) }}°C
                                    </span>
                                </v-tooltip>
                            </template>
                        </v-col>
                        <v-col class="px-6 col-auto d-flex justify-end align-center">
                            <v-progress-circular
                                :rotate="-90"
                                :size="55"
                                :width="7"
                                :value="Math.round(hostLoadPercent)"
                                :color="convertProgressColor(hostLoadPercent)"
                            >
                                {{ hostLoadPercent.toFixed(0) }}
                            </v-progress-circular>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
        </v-card>
        <v-dialog v-model="mcuDetailsDialog.bool" :max-width="400" :max-height="500" scrollable>
            <v-card dark>
                <v-toolbar flat dense >
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-text-box-search-outline</v-icon>{{ mcuDetailsDialog.headline }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" color="grey darken-3" @click="mcuDetailsDialog.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-5" style="height: 350px;">
                    <template v-if="'mcu_constants' in mcuDetailsDialog.mcu">
                        <v-row>
                            <v-col><span class="headline">{{ $t('Machine.SystemPanel.Constants') }}</span></v-col>
                        </v-row>
                        <div v-for="(value, key, index) in mcuDetailsDialog.mcu.mcu_constants" :key="key">
                            <v-divider class="my-3" v-if="index"></v-divider>
                            <v-row>
                                <v-col>{{ key }}</v-col>
                                <v-col class="text-right">{{ value }}</v-col>
                            </v-row>
                        </div>
                    </template>
                    <template v-if="'last_stats' in mcuDetailsDialog.mcu">
                        <v-row class="mt-5">
                            <v-col><span class="headline">{{ $t('Machine.SystemPanel.LastStats') }}</span></v-col>
                        </v-row>
                        <div v-for="(value, key, index) in mcuDetailsDialog.mcu.last_stats" :key="key">
                            <v-divider class="my-3" v-if="index"></v-divider>
                            <v-row>
                                <v-col>{{ key }}</v-col>
                                <v-col class="text-right">{{ value }}</v-col>
                            </v-row>
                        </div>
                    </template>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="hostDetailsDialog.bool" :max-width="600" :max-height="500" scrollable>
            <v-card dark>
                <v-toolbar flat dense >
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-text-box-search-outline</v-icon>{{ $t('Machine.SystemPanel.HostDetails') }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn small class="minwidth-0" color="grey darken-3" @click="hostDetailsDialog.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-5" style="height: 350px;">
                    <template v-if="Object.keys(systemInfo).length">
                        <div v-for="(infoGroup, key, index) of systemInfo" v-bind:key="key">
                            <v-row :class="index ? 'mt-5' : ''">
                                <v-col><span class="headline">{{ key }}</span></v-col>
                            </v-row>
                            <div v-for="(value, key, index) in infoGroup" :key="key">
                                <v-divider class="my-3" v-if="index"></v-divider>
                                <v-row>
                                    <v-col>{{ key }}</v-col>
                                    <v-col class="text-right">{{ value }}</v-col>
                                </v-row>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <v-row class="mt-5">
                            <v-col><p>No more Infos</p></v-col>
                        </v-row>
                    </template>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "../../mixins/base";

@Component
export default class SystemPanel extends Mixins(BaseMixin) {
    private mcuDetailsDialog: { bool: boolean, headline: string, mcu: any } = {
        bool: false,
        headline: "",
        mcu: {}
    }

    private hostDetailsDialog: { bool: boolean } = {
        bool: false,
    }

    get settings() {
        return this.$state.state.printer.settings?.configfile?.settings ?? {}
    }

    get mcus() {
        return this.$store.getters["printer/getMcus"] ?? []
    }

    get systemStats() {
        return this.$store.state.printer.system_stats ?? null
    }

    get systemInfo() {
        return this.$store.state.server.system_info ?? null
    }

    get systemVersion() {
        return this.$store.state.printer.software_version ?? null
    }

    get hostCpuName() {
        if (
            'cpu_info' in this.$store.state.server.system_info &&
            'processor' in this.$store.state.server.system_info.cpu_info
        ) return this.$store.state.server.system_info.cpu_info.processor

        if ('cpu_info' in this.$store.state.printer) {
            const cpuInfo = this.$store.state.printer.cpu_info
            const positionCors = cpuInfo.indexOf("core")

            return cpuInfo.substr(positionCors + 4).trim()
        }

        return false
    }

    get hostCpuCors() {
        if (
            'cpu_info' in this.$store.state.server.system_info &&
            'cpu_count' in this.$store.state.server.system_info.cpu_info
        ) return this.$store.state.server.system_info.cpu_info.cpu_count

        if ('cpu_info' in this.$store.state.printer) {
            const cpuInfo = this.$store.state.printer.cpu_info
            const positionCors = cpuInfo.indexOf("core")
            return parseInt(cpuInfo.substr(0, positionCors).trim())
        }

        return 1
    }

    get hostLoad() {
        if (
            'system_stats' in this.$store.state.printer &&
            'sysload' in this.$store.state.printer.system_stats
        ) return this.$store.state.printer.system_stats.sysload

        return 0
    }

    get hostLoadPercent() {
        if (
            'system_stats' in this.$store.state.printer &&
            'sysload' in this.$store.state.printer.system_stats
        ) {
            const percent = this.$store.state.printer.system_stats.sysload / this.hostCpuCors * 100
            return percent < 100 ? percent : 100
        }

        return 0
    }

    get memavail() {
        if (
            'system_stats' in this.$store.state.printer &&
            'memavail' in this.$store.state.printer.system_stats
        ) return this.$store.state.printer.system_stats.memavail * 1024

        return 0
    }

    get hostTempSensor() {
        const tempSensorConfig = this.$store.getters["printer/getHostTempSensor"]

        if (tempSensorConfig && 'key' in tempSensorConfig) {
            return this.$store.getters["printer/getPrinterObject"](tempSensorConfig.key)
        }

        return false
    }

    get mcuTempSensors() {
        return this.$store.getters["printer/getMcuTempSensors"]
    }

    mcuVersion(mcu) {
        const original = mcu.mcu_version ?? "unknown"
        const splits = original.split("-")

        if (splits.length > 3 && splits[3] === 'dirty')
            return splits.slice(0, 3).join("-")
        else if (splits.length > 2)
            return splits.slice(0,2).join("-")

        return 'unknown'
    }

    mcuLoad(mcu) {
        if (
            'last_stats' in mcu &&
            'mcu_task_avg' in mcu.last_stats &&
            'mcu_task_stddev' in mcu.last_stats
        ) return (mcu.last_stats.mcu_task_avg + 3*mcu.last_stats.mcu_task_stddev) / 0.0025

        return 0
    }

    mcuLoadPercent(mcu) {
        const percent = this.getMcuLoad(mcu) * 100
        return percent < 100 ? percent : 100
    }

    mcuAwake(mcu) {
        if (
            'last_stats' in mcu &&
            'mcu_awake' in mcu.last_stats
        ) return mcu.last_stats.mcu_awake / 5

        return 0
    }

    mcuFrequency(mcu) {
        if (
            'last_stats' in mcu &&
            'freq' in mcu.last_stats
        ) return this.formatFrequency(mcu.last_stats.freq)

        return false
    }

    mcuChip(mcu) {
        if (
            'mcu_constants' in mcu &&
            'MCU' in mcu.mcu_constants
        ) return mcu.mcu_constants.MCU

        return null
    }

    mcuTempSensor(mcuName) {
        if (mcuName.indexOf(" ") !== -1) {
            mcuName = mcuName.substr(mcuName.indexOf(" ") + 1)
        }

        const mcuTempSensor = Object.entries(this.mcuTempSensors).find(([, object]) => {
            return (object.settings.sensor_mcu === mcuName)
        })

        if (mcuTempSensor && mcuTempSensor.length > 1 && 'object' in mcuTempSensor[1]) return mcuTempSensor[1].object

        return false
    }

    formatFrequency(frequency: number): string {
        let i = -1
        const units = [' kHz', ' MHz', ' GHz']
        do {
            frequency = frequency / 1000
            i++
        } while (frequency > 1000)

        return Math.max(frequency, 0.1).toFixed() + units[i]
    }

    openMcuDetails(key, mcu) {
        this.mcuDetailsDialog.headline = key
        this.mcuDetailsDialog.mcu = mcu
        this.mcuDetailsDialog.bool = true
    }

    convertProgressColor(percent) {
        if (percent > 95) return 'error'
        else if (percent > 80) return 'warning'

        return 'primary'
    }
}
</script>