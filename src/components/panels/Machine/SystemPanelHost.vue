<style scoped>
.cursor--pointer {
    cursor: pointer;
}
</style>

<template v-if="hostStats">
    <div>
        <v-row class="py-0 pr-4">
            <v-col class="pl-6">
                <strong style="cursor: pointer" @click="hostDetailsDialog = true">Host</strong>
                <v-tooltip top>
                    <template #activator="{ props }">
                        <small v-if="hostStats.cpuName" class="ml-2" v-bind="props">({{ cpuName }})</small>
                    </template>
                    <span>{{ cpuDesc }}</span>
                </v-tooltip>
                <br />
                <div class="text-body-2">
                    <div v-if="hostStats.version">
                        {{ $t('Machine.SystemPanel.Values.Version', { version: hostStats.version }) }}
                    </div>
                    <div v-if="hostStats.os">
                        {{ $t('Machine.SystemPanel.Values.Os', { os: hostStats.os }) }}
                    </div>
                    <div v-if="releaseName" class="text-no-wrap">
                        {{
                            $t('Machine.SystemPanel.Values.Distro', {
                                name: releaseName,
                                version_id: hostStats.release_info.version_id,
                            })
                        }}
                        <template v-if="hostStats.release_info.codename">
                            ({{ hostStats.release_info.codename }})
                        </template>
                    </div>
                    <div>
                        <span class="text-no-wrap">
                            {{ $t('Machine.SystemPanel.Values.Load', { load: hostStats.load }) }},
                        </span>
                        <span v-if="hostStats.memoryFormat" class="d-inline-block text-no-wrap">
                            {{ $t('Machine.SystemPanel.Values.Memory', { memory: hostStats.memoryFormat }) }}
                        </span>
                        <span class="text-no-wrap">
                            <template v-if="hostStats.tempSensor">
                                <template
                                    v-if="
                                        hostStats.tempSensor.measured_min_temp !== null &&
                                        hostStats.tempSensor.measured_max_temp !== null
                                    ">
                                    <v-tooltip top>
                                        <template #activator="{ props }">
                                            <span v-bind="props">
                                                ,
                                                {{
                                                    $t('Machine.SystemPanel.Values.Temp', {
                                                        temp: hostStats.tempSensor.temperature,
                                                    })
                                                }}
                                            </span>
                                        </template>
                                        <span>
                                            {{
                                                $t('Machine.SystemPanel.Values.TempMax', {
                                                    temp: hostStats.tempSensor.measured_max_temp,
                                                })
                                            }}
                                            <br />
                                            {{
                                                $t('Machine.SystemPanel.Values.TempMin', {
                                                    temp: hostStats.tempSensor.measured_min_temp,
                                                })
                                            }}
                                        </span>
                                    </v-tooltip>
                                </template>
                                <span v-else>
                                    ,
                                    {{
                                        $t('Machine.SystemPanel.Values.Temp', {
                                            temp: hostStats.tempSensor.temperature,
                                        })
                                    }}
                                </span>
                            </template>
                        </span>
                    </div>
                    <template v-if="networkInterfaces">
                        <div v-for="(interfaceStats, interfaceName) in networkInterfaces" :key="interfaceName">
                            <span class="text-no-wrap">
                                {{ interfaceName }}
                                <template v-if="'details' in interfaceStats">
                                    {{ getIpAddress(interfaceStats.details.ip_addresses) }}
                                </template>
                                :
                            </span>
                            <span class="text-no-wrap">
                                {{
                                    $t('Machine.SystemPanel.Values.Bandwidth', {
                                        bandwidth: formatFilesize(interfaceStats.bandwidth),
                                    })
                                }}
                            </span>
                            ,
                            <span class="text-no-wrap">
                                {{
                                    $t('Machine.SystemPanel.Values.Received', {
                                        received: formatFilesize(interfaceStats.rx_bytes),
                                    })
                                }}
                            </span>
                            ,
                            <span class="text-no-wrap">
                                {{
                                    $t('Machine.SystemPanel.Values.Transmitted', {
                                        transmitted: formatFilesize(interfaceStats.tx_bytes),
                                    })
                                }}
                            </span>
                        </div>
                    </template>
                </div>
            </v-col>
            <v-col v-if="cpuUsage !== null" class="px-2 col-auto d-flex flex-column justify-center align-center">
                <v-progress-circular :rotate="-90" :size="55" :width="7" :value="cpuUsage" :color="cpuUsageColor">
                    {{ cpuUsage }}
                </v-progress-circular>
                <span class="mt-2">{{ $t('Machine.SystemPanel.Cpu') }}</span>
            </v-col>
            <v-col v-else class="px-2 col-auto d-flex flex-column justify-center align-center">
                <v-progress-circular
                    :rotate="-90"
                    :size="55"
                    :width="7"
                    :value="hostStats.loadPercent"
                    :color="hostStats.loadProgressColor">
                    {{ hostStats.loadPercent }}
                </v-progress-circular>
                <span class="mt-2">{{ $t('Machine.SystemPanel.Load') }}</span>
            </v-col>
            <v-col
                v-if="hostStats.memUsage !== null"
                class="px-2 col-auto d-flex flex-column justify-center align-center">
                <v-progress-circular
                    :rotate="-90"
                    :size="55"
                    :width="7"
                    :value="hostStats.memUsage"
                    :color="hostStats.memUsageColor">
                    {{ hostStats.memUsage }}
                </v-progress-circular>
                <span class="mt-2">{{ $t('Machine.SystemPanel.Memory') }}</span>
            </v-col>
        </v-row>
        <v-dialog v-model="hostDetailsDialog" :max-width="600" :max-height="500" scrollable>
            <panel
                :title="$t('Machine.SystemPanel.HostDetails')"
                :icon="mdiTextBoxSearchOutline"
                card-class="machine-systemload-host-details-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="hostDetailsDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pt-5 px-0">
                    <overlay-scrollbars style="height: 350px" class="px-6">
                        <template v-if="Object.keys(systemInfo).length">
                            <div v-for="(infoGroup, key, index) of systemInfo" :key="key">
                                <template v-if="key !== 'available_services'">
                                    <v-row :class="index ? 'mt-5' : ''">
                                        <v-col>
                                            <span class="headline">{{ key }}</span>
                                        </v-col>
                                    </v-row>
                                    <div v-for="(value, key2, index2) in infoGroup" :key="key2">
                                        <v-divider v-if="index2" class="my-3"></v-divider>
                                        <v-row>
                                            <v-col>{{ key2 }}</v-col>
                                            <v-col class="text-right">{{ value }}</v-col>
                                        </v-row>
                                    </div>
                                </template>
                            </div>
                        </template>
                        <template v-else>
                            <v-row class="mt-5">
                                <v-col>
                                    <p>{{ $t('Machine.SystemPanel.NoMoreInfos') }}</p>
                                </v-col>
                            </v-row>
                        </template>
                    </overlay-scrollbars>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import Panel from '@/components/ui/Panel.vue'
import { formatFilesize } from '@/plugins/helpers'
import { mdiTextBoxSearchOutline, mdiCloseThick } from '@mdi/js'

const { klipperReadyForGui } = useBase()
const store = useStore()

const mdiCloseThick = mdiCloseThick
const mdiTextBoxSearchOutline = mdiTextBoxSearchOutline

const hostDetailsDialog = ref(false)

const hostStats = computed(() => store.getters['server/getHostStats'] ?? null)

const systemInfo = computed(() => store.state.server?.system_info ?? {})

const releaseName = computed(() => {
    const stats = hostStats.value
    if (!stats) return null
    const name = stats.release_info?.name ?? ''
    if (name.startsWith('#')) return stats.release_info?.id ?? null
    if (name.startsWith('0.')) return null
    return name
})

const directory = computed(() => store.getters['files/getDirectory']('gcodes'))

const disk_usage = computed(() => directory.value?.disk_usage ?? { used: 0, free: 0, total: 0 })

const cpuUsage = computed(() => store.getters['server/getCpuUsage'] ?? null)

const cpuUsageColor = computed(() => {
    let color = 'primary'
    if (cpuUsage.value > 95) color = 'error'
    else if (cpuUsage.value > 80) color = 'warning'
    return color
})

const networkInterfaces = computed(() => store.getters['server/getNetworkInterfaces'] ?? null)

function getIpAddress(ip_addresses: { family: string; address: string }[]) {
    const ipv4 = ip_addresses.find((address) => address.family === 'ipv4')
    if (ipv4) return ` (${ipv4.address})`
    const ipv6 = ip_addresses.find((address) => address.family === 'ipv6')
    if (ipv6) return ` (${ipv6.address})`
    return null
}

const cpuDesc = computed(() => hostStats.value?.cpuDesc ?? '')

const cpuName = computed(() => {
    const stats = hostStats.value
    if (!stats) return ''
    let output = stats.cpuName
    if (stats.bits) output += `, ${stats.bits}`
    return output
})
</script>
