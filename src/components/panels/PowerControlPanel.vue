<style>
</style>

<template>
    <div>
        <v-card>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-power" left></v-icon>{{ $t('Panels.PowerControlPanel.PowerControl') }}
                    </span>
                </v-toolbar-title>
            </v-toolbar>

            <div v-for="(device, index) in devices" v-bind:key="index">
                <v-divider class="mt-0" v-if="index > 0"></v-divider>
                <v-card-text class="py-2">
                    <v-row>
                        <v-col class="py-0 pt-1">{{ device.device }}</v-col>
                        <v-col class="py-0 text-right">
                            <v-btn-toggle v-model="device.status">
                                <v-btn small v-if="device.status === 'error'" disabled>{{ $t('Panels.PowerControlPanel.Error') }}</v-btn>
                                <v-btn small v-if="device.status !== 'error'" :disabled="device.status === 'on'" @click="setPower(device,1)">{{ $t('Panels.PowerControlPanel.On') }}</v-btn>
                                <v-btn small v-if="device.status !== 'error'" :disabled="device.status === 'off'" @click="setPower(device,0)">{{ $t('Panels.PowerControlPanel.Off') }}</v-btn>
                            </v-btn-toggle>
                        </v-col>
                    </v-row>
                </v-card-text>
            </div>
        </v-card>
    </div>
</template>

<script>
import { mapState } from "vuex";
import Vue from "vue";

export default {
    components: {},

    computed: {
        ...mapState({
            devices: (state) => state.server.power.devices,
        }),
    },
    methods: {
        setPower(device, value) {
            let rpc = value === 1 ? "machine.device_power.on" : "machine.device_power.off";
            Vue.prototype.$socket.sendObj(rpc,{ [device.device]: null },"server/power/responseToggle");
        },
    },
};
</script>