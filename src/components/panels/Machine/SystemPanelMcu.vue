<template>
    <div>
        <v-row class="py-0 pr-4">
            <v-col class="pl-6">
                <strong style="cursor: pointer" @click="mcuDetailsDialog = true">{{ mcu.name }}</strong>
                <small v-if="mcu.chip" class="ml-2">({{ mcu.chip }})</small>
                <br />
                <div class="text-body-2">
                    {{ $t('Machine.SystemPanel.Version') }}: {{ mcu.version }}
                    <br />
                    {{ $t('Machine.SystemPanel.Load') }}: {{ mcu.load }}, {{ $t('Machine.SystemPanel.Awake') }}:
                    {{ mcu.awake }}
                    <span v-if="mcu.freq !== null">
                        , {{ $t('Machine.SystemPanel.Frequency') }}: {{ mcu.freqFormat }}
                    </span>
                    <template v-if="mcu.tempSensor">
                        <span>,</span>
                        <template
                            v-if="
                                mcu.tempSensor.measured_min_temp !== null && mcu.tempSensor.measured_max_temp !== null
                            ">
                            <v-tooltip top>
                                <template #activator="{ on, attrs }">
                                    <span v-bind="attrs" v-on="on">Temp: {{ mcu.tempSensor.temperature + '°C' }}</span>
                                </template>
                                <span>
                                    max: {{ mcu.tempSensor.measured_max_temp }}°C
                                    <br />
                                    min: {{ mcu.tempSensor.measured_min_temp }}°C
                                </span>
                            </v-tooltip>
                        </template>
                        <template v-else>Temp: {{ mcu.tempSensor.temperature + '°C' }}</template>
                    </template>
                </div>
            </v-col>
            <v-col class="px-2 col-auto d-flex justify-center align-center">
                <v-progress-circular
                    :rotate="-90"
                    :size="55"
                    :width="7"
                    :value="mcu.loadPercent"
                    :color="mcu.loadProgressColor">
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
                    <v-btn icon tile @click="mcuDetailsDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text class="pt-5 px-0">
                    <overlay-scrollbars style="height: 350px" class="px-6">
                        <template v-if="mcu.mcu_constants">
                            <v-row>
                                <v-col>
                                    <span class="headline">{{ $t('Machine.SystemPanel.Constants') }}</span>
                                </v-col>
                            </v-row>
                            <div v-for="(value, key, index) in mcu.mcu_constants" :key="key">
                                <v-divider class="my-3" v-if="index"></v-divider>
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
                                <v-divider class="my-3" v-if="index"></v-divider>
                                <v-row>
                                    <v-col>{{ key }}</v-col>
                                    <v-col class="text-right">{{ value }}</v-col>
                                </v-row>
                            </div>
                        </template>
                    </overlay-scrollbars>
                </v-card-text>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import { formatFilesize } from '@/plugins/helpers'
import { PrinterStateMcu } from '@/store/printer/types'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class SystemPanelMcu extends Mixins(BaseMixin) {
    formatFilesize = formatFilesize
    mdiCloseThick = mdiCloseThick

    @Prop({ required: true }) readonly mcu!: PrinterStateMcu
    private mcuDetailsDialog = false
}
</script>
