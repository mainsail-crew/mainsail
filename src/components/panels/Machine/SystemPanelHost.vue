<style scoped>
    .cursor--pointer {
        cursor: pointer;
    }
</style>

<template v-if="hostStats">
    <div>
        <v-row class="py-0">
            <v-col class="pl-6">
                <strong style="cursor: pointer;" @click="hostDetailsDialog = true">Host</strong>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <small v-if="hostStats.cpuName" class="ml-2" v-bind="attrs" v-on="on">({{ hostStats.cpuName }})</small>
                    </template>
                    <span v-if="hostStats.cpuDesc">{{ hostStats.cpuDesc }}</span>
                </v-tooltip>
                <br />
                <span v-if="hostStats.version">{{ $t('Machine.SystemPanel.Version') }}: {{ hostStats.version }}<br /></span>
                <span v-if="hostStats.os">{{ $t('Machine.SystemPanel.Os') }}: {{ hostStats.os }}<br /></span>
                <span v-if="hostStats.release_info && hostStats.release_info.name !== '0.'">{{ $t('Machine.SystemPanel.Distro') }}: {{ hostStats.release_info.name }} {{ hostStats.release_info.version_id }} <span v-if="hostStats.release_info.codename">({{ hostStats.release_info.codename }})</span><br /></span>
                <span>{{ $t('Machine.SystemPanel.Load') }}: {{ hostStats.load }}</span>
                <span v-if="cpuUsage">, {{ $t('Machine.SystemPanel.CPU') }}: {{ cpuUsage }}%</span>
                <span v-if="hostStats.memoryFormat">, {{ $t('Machine.SystemPanel.Memory') }}: {{ hostStats.memoryFormat }}</span>
                <span v-if="disk_usage.total > 0">, {{ $t('Machine.SystemPanel.Disk') }}: {{ formatFilesize(disk_usage.used) }} / {{ formatFilesize(disk_usage.total) }}</span>
                <span v-for="(interfaceStats, interfaceName) in networkInterfaces" :key="interfaceName">, {{ interfaceName }}: {{ formatFilesize(interfaceStats.bandwidth) }}/s</span>
                <template v-if="hostStats.tempSensor">
                    <span>, </span>
                    <template v-if="hostStats.tempSensor.measured_min_temp !== null && hostStats.tempSensor.measured_max_temp !== null">
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <span v-bind="attrs" v-on="on">Temp: {{ hostStats.tempSensor.temperature+"°C" }}</span>
                            </template>
                            <span>
                                max: {{ hostStats.tempSensor.measured_max_temp }}°C<br />
                                min: {{ hostStats.tempSensor.measured_min_temp }}°C
                            </span>
                        </v-tooltip>
                    </template>
                    <template v-else>
                        Temp: {{ hostStats.tempSensor.temperature+"°C" }}
                    </template>
                </template>
            </v-col>
            <v-col class="px-6 col-auto d-flex justify-end align-center">
                <v-progress-circular
                    :rotate="-90"
                    :size="55"
                    :width="7"
                    :value="hostStats.loadPercent"
                    :color="hostStats.loadProgressColor"
                >
                    {{ hostStats.loadPercent }}
                </v-progress-circular>
            </v-col>
        </v-row>
        <v-dialog v-model="hostDetailsDialog" :max-width="600" :max-height="500" scrollable>
            <panel :title="$t('Machine.SystemPanel.HostDetails')" icon="mdi-text-box-search-outline" card-class="machine-systemload-host-details-dialog" :margin-bottom="false">
                <template v-slot:buttons>
                    <v-btn icon tile @click="hostDetailsDialog = false"><v-icon>mdi-close-thick</v-icon></v-btn>
                </template>
                <v-card-text class="pt-5 px-0">
                    <overlay-scrollbars style="height: 350px;" class="px-6">
                        <template v-if="Object.keys(systemInfo).length">
                            <div v-for="(infoGroup, key, index) of systemInfo" v-bind:key="key">
                                <template v-if="key !== 'available_services'">
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
                                </template>
                            </div>
                        </template>
                        <template v-else>
                            <v-row class="mt-5">
                                <v-col><p>No more Infos</p></v-col>
                            </v-row>
                        </template>
                    </overlay-scrollbars>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import {formatFilesize} from '@/plugins/helpers'
@Component({
    components: {Panel}
})
export default class SystemPanelHost extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize

    private hostDetailsDialog = false

    get hostStats() {
        return this.$store.getters['server/getHostStats'] ?? null
    }

    get systemInfo() {
        return this.$store.state.server?.system_info ?? {}
    }

    get directory() {
        return this.$store.getters['files/getDirectory']('gcodes')
    }

    get disk_usage() {
        return this.directory?.disk_usage ?? { used: 0, free: 0, total: 0}
    }

    get cpuUsage() {
        return this.$store.getters['server/getCpuUsage'] ?? null
    }

    get networkInterfaces() {
        return this.$store.getters['server/getNetworkInterfaces'] ?? null
    }
}
</script>