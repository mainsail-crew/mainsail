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
                <div v-for="(mcu, index) of mcus" v-bind:key="mcu.name">
                    <v-divider class="my-2" v-if="index" ></v-divider>
                    <v-row class="py-0">
                        <v-col class="pl-6">
                            <strong style="cursor: pointer;" @click="openMcuDetails(mcu)">{{ mcu.name }}</strong><small v-if="mcu.chip" class="ml-2">({{ mcu.chip }})</small><br />
                            {{ $t('Machine.SystemPanel.Version') }}: {{ mcu.version }}<br />
                            {{ $t('Machine.SystemPanel.Load') }}: {{ mcu.load }},
                            {{ $t('Machine.SystemPanel.Awake') }}: {{ mcu.awake }}
                            <span v-if="mcu.freq !== null">, {{ $t('Machine.SystemPanel.Frequency') }}: {{ mcu.freqFormat }}</span>
                            <template v-if="mcu.tempSensor">
                                <span>, </span>
                                <template v-if="mcu.tempSensor.measured_min_temp !== null && mcu.tempSensor.measured_max_temp !== null">
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on, attrs }">
                                            <span v-bind="attrs" v-on="on">Temp: {{ mcu.tempSensor.temperature+"°C" }}</span>
                                        </template>
                                        <span>
                                            max: {{ mcu.tempSensor.measured_max_temp }}°C<br />
                                            min: {{ mcu.tempSensor.measured_min_temp }}°C
                                        </span>
                                    </v-tooltip>
                                </template>
                                <template v-else>
                                    Temp: {{ mcu.tempSensor.temperature+"°C" }}
                                </template>
                            </template>
                        </v-col>
                        <v-col class="px-6 col-auto d-flex justify-end align-center">
                            <v-progress-circular
                                :rotate="-90"
                                :size="55"
                                :width="7"
                                :value="mcu.loadPercent"
                                :color="mcu.loadProgressColor"
                            >
                                {{ mcu.loadPercent }}
                            </v-progress-circular>
                        </v-col>
                    </v-row>
                </div>
                <div v-if="hostStats">
                    <v-divider class="my-2" v-if="mcus.length" ></v-divider>
                    <v-row class="py-0">
                        <v-col class="pl-6">
                            <strong style="cursor: pointer;" @click="hostDetailsDialog.bool = true">Host</strong>
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <small v-if="hostStats.cpuName" class="ml-2" v-bind="attrs" v-on="on">({{ hostStats.cpuName }})</small>
                                </template>
                                <span v-if="hostStats.cpuDesc">{{ hostStats.cpuDesc }}</span>
                            </v-tooltip>
                            <br />
                            <span v-if="hostStats.version">{{ $t('Machine.SystemPanel.Version') }}: {{ hostStats.version }}<br /></span>
                            <span v-if="hostStats.os">{{ $t('Machine.SystemPanel.Os') }}: {{ hostStats.os }}<br /></span>
                            <span>{{ $t('Machine.SystemPanel.Load') }}: {{ hostStats.load }}</span>
                            <span v-if="hostStats.memoryFormat">, {{ $t('Machine.SystemPanel.Memory') }}: {{ hostStats.memoryFormat }}</span>
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
                    <v-btn small class="minwidth-0 px-2" color="grey darken-3" @click="mcuDetailsDialog.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-5" style="height: 350px;">
                    <template v-if="mcuDetailsDialog.mcu.mcu_constants">
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
                    <template v-if="mcuDetailsDialog.mcu.last_stats">
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
                    <v-btn small class="minwidth-0 px-2" color="grey darken-3" @click="hostDetailsDialog.bool = false"><v-icon small>mdi-close-thick</v-icon></v-btn>
                </v-toolbar>
                <v-card-text class="pt-5" style="height: 350px;">
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
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "../../mixins/base";
import {formatFilesize} from "@/plugins/helpers";

@Component
export default class SystemPanel extends Mixins(BaseMixin) {

    private mcuDetailsDialog: { bool: boolean, headline: string, mcu: any } = {
        bool: false,
        headline: "",
        mcu: {
            mcu_constants: null,
            last_stats: null,
        }
    }

    private hostDetailsDialog: { bool: boolean } = {
        bool: false,
    }

    get mcus() {
        return this.$store.getters["printer/getMcus"] ?? []
    }

    get hostStats() {
        return this.$store.getters["server/getHostStats"] ?? null
    }

    get systemInfo() {
        return this.$store.state.server?.system_info ?? {}
    }

    openMcuDetails(mcu: any) {
        this.mcuDetailsDialog.headline = mcu.name
        this.mcuDetailsDialog.mcu.mcu_constants = {...mcu.mcu_constants}
        this.mcuDetailsDialog.mcu.last_stats = {...mcu.last_stats}
        this.mcuDetailsDialog.bool = true
    }
}
</script>