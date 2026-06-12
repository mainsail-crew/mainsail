<template>
    <div>
        <v-row class="system-load-row py-0 pr-4 flex-nowrap" align="center">
            <v-col class="col system-load-row__info pl-6 pr-4">
                <strong style="cursor: pointer" @click="mcuDetailsDialog = true">{{ mcu.name }}</strong>
                <small v-if="mcu.chip" class="ml-2">({{ mcu.chip }})</small>
                <br />
                <div class="text-body-2">
                    <div class="text-no-wrap">
                        {{ $t('Machine.SystemPanel.Values.Version', { version: mcu.version }) }}
                    </div>
                    <div>
                        <span class="text-no-wrap">
                            {{ $t('Machine.SystemPanel.Values.Load', { load: mcu.load }) }},
                        </span>
                        <span class="text-no-wrap">
                            {{ $t('Machine.SystemPanel.Values.Awake', { awake: mcu.awake }) }},
                        </span>
                        <span v-if="mcu.freq !== null" class="text-no-wrap">
                            {{ $t('Machine.SystemPanel.Values.Frequency', { frequency: mcu.freqFormat }) }},
                        </span>
                        <template v-if="mcu.tempSensor">
                            <template
                                v-if="
                                    mcu.tempSensor.measured_min_temp !== null &&
                                    mcu.tempSensor.measured_max_temp !== null
                                ">
                                <v-tooltip top>
                                    <template #activator="{ props: activatorProps }">
                                        <span v-bind="activatorProps">
                                            {{
                                                $t('Machine.SystemPanel.Values.Temp', {
                                                    temp: mcu.tempSensor.temperature,
                                                })
                                            }}
                                        </span>
                                    </template>
                                    <span>
                                        {{
                                            $t('Machine.SystemPanel.Values.TempMax', {
                                                temp: mcu.tempSensor.measured_max_temp,
                                            })
                                        }}
                                        <br />
                                        {{
                                            $t('Machine.SystemPanel.Values.TempMin', {
                                                temp: mcu.tempSensor.measured_min_temp,
                                            })
                                        }}
                                    </span>
                                </v-tooltip>
                            </template>
                            <span v-else class="text-no-wrap">
                                {{
                                    $t('Machine.SystemPanel.Values.Temp', {
                                        temp: mcu.tempSensor.temperature,
                                    })
                                }}
                            </span>
                        </template>
                    </div>
                </div>
            </v-col>
            <v-col class="system-load-row__gauge px-2 col-auto d-flex justify-center align-center">
                <v-progress-circular
                    :rotate="-90"
                    :size="55"
                    :width="7"
                    :value="mcu.loadPercent"
                    :color="mcu.loadProgressColor"
                    :aria-label="`${mcu.name} ${mcu.loadPercent}%`">
                    {{ mcu.loadPercent }}
                </v-progress-circular>
            </v-col>
        </v-row>
        <v-dialog v-model="mcuDetailsDialog" :max-width="400" :max-height="500" scrollable>
            <panel
                :title="mcu.name"
                icon="mdi-text-box-search-outline"
                card-class="machine-systemload-mcu-details-dialog"
                :margin-bottom="false">
                <template #buttons>
                    <v-btn :icon="mdiCloseThick" tile @click="mcuDetailsDialog = false" />
                </template>
                <v-card-text class="pt-5 px-0">
                    <OverlayScrollbarsComponent style="height: 350px" class="px-6">
                        <template v-if="mcu.mcu_constants">
                            <v-row>
                                <v-col>
                                    <span class="headline">{{ $t('Machine.SystemPanel.Constants') }}</span>
                                </v-col>
                            </v-row>
                            <div v-for="(value, key, index) in mcu.mcu_constants" :key="key">
                                <v-divider v-if="index" class="my-3"></v-divider>
                                <v-row>
                                    <v-col>{{ key }}</v-col>
                                    <v-col class="text-right">{{ value }}</v-col>
                                </v-row>
                            </div>
                        </template>
                        <template v-if="mcu.last_stats">
                            <v-row class="mt-5">
                                <v-col>
                                    <span class="headline">{{ $t('Machine.SystemPanel.LastStats') }}</span>
                                </v-col>
                            </v-row>
                            <div v-for="(value, key, index) in mcu.last_stats" :key="key">
                                <v-divider v-if="index" class="my-3"></v-divider>
                                <v-row>
                                    <v-col>{{ key }}</v-col>
                                    <v-col class="text-right">{{ value }}</v-col>
                                </v-row>
                            </div>
                        </template>
                    </OverlayScrollbarsComponent>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Panel from '@/components/ui/Panel.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { mdiCloseThick } from '@mdi/js'
import type { PrinterStateMcu } from '@/store/printer/types'

defineProps<{
    mcu: PrinterStateMcu
}>()

const mcuDetailsDialog = ref(false)
</script>

<style scoped>
.system-load-row {
    width: 100%;
}

.system-load-row__info {
    min-width: 0;
}

.system-load-row__gauge {
    flex: 0 0 auto;
    margin-left: auto;
    width: fit-content;
}
</style>
