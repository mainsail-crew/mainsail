<template>
    <v-row class="py-0 flex-nowrap">
        <v-col class="pl-6 pr-0 d-flex flex-column max-width-content">
            <div class="d-flex">
                <strong class="cursor-pointer" @click="hostDetailsDialog = true">Host</strong>
                <v-tooltip :disabled="!cpuDesc" top>
                    <template #activator="{ on, attrs }">
                        <small v-if="cpuName" class="ml-2" v-bind="attrs" v-on="on">({{ cpuName }})</small>
                    </template>
                    <span>{{ cpuDesc }}</span>
                </v-tooltip>
            </div>
            <div class="text-body-2 d-flex flex-column">
                <div v-for="(text, index) in longDetails" :key="index" class="text-truncate">{{ text }}</div>
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
                <SystemPanelHostInterface v-for="name in interfaces" :key="name" :name="name" />
            </div>
        </v-col>
        <v-col class="pl-2 pr-6 col-auto d-flex flex-column justify-center flex-sm-row" style="gap: 1rem">
            <div class="d-flex flex-column justify-center align-center">
                <v-progress-circular
                    :rotate="-90"
                    :size="55"
                    :width="7"
                    :value="circleCpuValue"
                    :color="circleCpuColor">
                    {{ circleCpuValue }}
                </v-progress-circular>
                <span class="mt-1">{{ circleCpuName }}</span>
            </div>
            <div v-if="memoryUsage !== null" class="d-flex flex-column justify-center align-center">
                <v-progress-circular :rotate="-90" :size="55" :width="7" :value="memoryUsage" :color="memoryUsageColor">
                    {{ memoryUsage }}
                </v-progress-circular>
                <span class="mt-1">{{ $t('Machine.SystemPanel.Memory') }}</span>
            </div>
        </v-col>
        <SystemPanelHostDialog :show="hostDetailsDialog" @close="hostDetailsDialog = false" />
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { formatFilesize } from '@/plugins/helpers'
import { mdiCloseThick } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class SystemPanelHost extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize
    mdiCloseThick = mdiCloseThick

    hostDetailsDialog = false

    get systemInfo() {
        return this.$store.state.server?.system_info ?? {}
    }

    get distribution() {
        return this.systemInfo?.distribution ?? null
    }

    get cpuInfo() {
        return this.systemInfo?.cpu_info ?? null
    }

    get cpuName() {
        const name = this.cpuInfo?.processor ?? null
        const bits = this.cpuInfo?.bits ?? null

        if (name && bits) return `${name}, ${bits}`

        return name
    }

    get cpuDesc() {
        return this.cpuInfo.cpu_desc ?? null
    }

    get longDetails() {
        const output = []

        if (this.softwareVersion) {
            output.push(this.$t('Machine.SystemPanel.Values.Version', { version: this.softwareVersion }).toString())
        }

        if (this.os) {
            output.push(this.$t('Machine.SystemPanel.Values.Os', { os: this.os }).toString())
        }

        if (this.releaseName) {
            let distro = this.$t('Machine.SystemPanel.Values.Distro', {
                name: this.releaseName,
                version_id: this.releaseInfo.version_id,
            }).toString()

            if (this.releaseInfo.codename) distro += ` (${this.releaseInfo.codename})`

            output.push(distro)
        }

        return output
    }

    get softwareVersion() {
        const version = this.$store.state.printer.software_version ?? null
        if (!version) return null

        const versionFormat = version.split('-').slice(0, 4).join('-')
        const app = this.$store.state.printer.app_name ?? 'Klipper'

        if (app !== 'Klipper') return `${app} ${versionFormat}`

        return versionFormat
    }

    get os() {
        return this.distribution?.name ?? null
    }

    get releaseInfo() {
        return this.distribution?.release_info ?? null
    }

    get releaseName() {
        const name = this.releaseInfo?.name ?? ''

        if (name.startsWith('#')) return this.releaseInfo?.id ?? null
        if (name.startsWith('0.')) return null

        return name
    }

    get additionalInfos() {
        const output: { text: string; tooltip?: string }[] = []

        output.push({ text: this.$t('Machine.SystemPanel.Values.Load', { load: this.load }).toString() })
        output.push({ text: this.$t('Machine.SystemPanel.Values.Memory', { memory: this.memoryFormat }).toString() })

        if (this.temperature && this.measuredMinTemp === null && this.measuredMaxTemp === null) {
            output.push({ text: this.$t('Machine.SystemPanel.Values.Temp', { temp: this.temperature }).toString() })
        } else if (this.temperature && this.measuredMinTemp !== null && this.measuredMaxTemp !== null) {
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

    get systemStats() {
        return this.$store.state.printer.system_stats ?? null
    }

    get cpuCores() {
        return this.cpuInfo?.cpu_count ?? 1
    }

    get load() {
        return Math.round((this.systemStats?.sysload ?? 0) * 100) / 100
    }

    get loadPercent() {
        return Math.round((this.load / this.cpuCores) * 100)
    }

    get loadColor() {
        if (this.loadPercent > 95) return 'error'
        if (this.loadPercent > 80) return 'warning'

        return 'primary'
    }

    get memoryAvailable() {
        return (this.systemStats?.memavail ?? 0) * 1024
    }

    get memoryTotal() {
        return (this.cpuInfo?.total_memory ?? 0) * 1024
    }

    get memoryUsed() {
        if (this.memoryAvailable === 0 || this.memoryTotal === 0) return 0

        return this.memoryTotal - this.memoryAvailable
    }

    get memoryFormat() {
        if (this.memoryUsed > 0) {
            return `${formatFilesize(this.memoryUsed)} / ${formatFilesize(this.memoryTotal)}`
        }

        return formatFilesize(this.memoryTotal)
    }

    get memoryUsage() {
        if (this.memoryAvailable === 0 || this.memoryTotal === 0) return null

        return Math.round(((this.memoryTotal - this.memoryAvailable) / this.memoryTotal) * 100)
    }

    get memoryUsageColor() {
        if (this.memoryUsage === null) return 'error'

        if (this.memoryUsage > 95) return 'error'
        if (this.memoryUsage > 80) return 'warning'

        return 'primary'
    }

    get tempSensor() {
        const sensorTypes = ['rpi_temperature', 'temperature_host']
        const checkObjects = ['temperature_sensor', 'temperature_fan']

        const sensorName = Object.keys(this.$store.state.printer).find((name) => {
            const type = name.split(' ')[0]
            if (!checkObjects.includes(type)) return false

            const settings = this.$store.state.printer.configfile?.settings ?? {}
            const sensorSettings = settings[name.toLowerCase()] ?? {}
            const sensorType = sensorSettings.sensor_type ?? ''

            return sensorTypes.includes(sensorType)
        })

        if (!sensorName) return null

        return this.$store.state.printer[sensorName]
    }

    get temperature() {
        if (this.tempSensor) return this.tempSensor.temperature.toFixed(1)

        return this.$store.state.server.cpu_temp?.toFixed(1)
    }

    get measuredMinTemp() {
        const value = this.tempSensor?.measured_min_temp ?? null

        return value !== null ? value.toFixed(1) : null
    }

    get measuredMaxTemp() {
        const value = this.tempSensor?.measured_max_temp ?? null

        return value !== null ? value.toFixed(1) : null
    }

    get interfaces() {
        return Object.keys(this.$store.state.server.network_stats)
            .filter((name) => name !== 'lo')
            .sort()
    }

    get cpuUsage() {
        const usage = this.$store.state.server.system_cpu_usage ?? null
        if ('cpu' in usage) return Math.round(usage.cpu)

        return null
    }

    get cpuUsageColor() {
        if (this.cpuUsage === null) return 'primary'

        if (this.cpuUsage > 95) return 'error'
        else if (this.cpuUsage > 80) return 'warning'

        return 'primary'
    }

    get circleCpuValue() {
        if (this.cpuUsage !== null) return this.cpuUsage

        return this.loadPercent
    }

    get circleCpuColor() {
        if (this.cpuUsage !== null) return this.cpuUsageColor

        return this.loadColor
    }

    get circleCpuName() {
        if (this.cpuUsage !== null) return this.$t('Machine.SystemPanel.Cpu').toString()

        return this.$t('Machine.SystemPanel.Load').toString()
    }

    get circleCpuClass() {
        const classes = []

        classes.push(this.memoryUsage !== null ? 'pr-3' : 'pr-6')

        return classes
    }

    get directory() {
        return this.$store.getters['files/getDirectory']('gcodes')
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0 }
    }
}
</script>
