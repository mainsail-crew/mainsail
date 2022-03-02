<style></style>

<template>
    <div>
        <v-card>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon left>{{ mdiPower }}</v-icon>
                        {{ $t('Panels.PowerControlPanel.PowerControl') }}
                    </span>
                </v-toolbar-title>
            </v-toolbar>

            <div v-for="(device, index) in devices" :key="index">
                <v-divider v-if="index > 0" class="mt-0"></v-divider>
                <v-card-text class="py-2">
                    <v-row>
                        <v-col class="py-0 pt-1">{{ device.device }}</v-col>
                        <v-col class="py-0 text-right">
                            <v-btn-toggle v-model="device.status">
                                <v-btn v-if="device.status === 'error'" small disabled>
                                    {{ $t('Panels.PowerControlPanel.Error') }}
                                </v-btn>
                                <v-btn
                                    v-if="device.status !== 'error'"
                                    small
                                    :disabled="device.status === 'on'"
                                    @click="setPower(device, 1)">
                                    {{ $t('Panels.PowerControlPanel.On') }}
                                </v-btn>
                                <v-btn
                                    v-if="device.status !== 'error'"
                                    small
                                    :disabled="device.status === 'off'"
                                    @click="setPower(device, 0)">
                                    {{ $t('Panels.PowerControlPanel.Off') }}
                                </v-btn>
                            </v-btn-toggle>
                        </v-col>
                    </v-row>
                </v-card-text>
            </div>
        </v-card>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Vue from 'vue'
import { mdiPower } from '@mdi/js'

export default {
    components: {},

    data: function () {
        return {
            mdiPower: mdiPower,
        }
    },

    computed: {
        ...mapState({
            devices: (state) => state.server.power.devices,
        }),
    },
    methods: {
        setPower(device, value) {
            let rpc = value === 1 ? 'machine.device_power.on' : 'machine.device_power.off'
            Vue.$socket.emit(rpc, { [device.device]: null }, 'server/power/responseToggle')
        },
    },
}
</script>
