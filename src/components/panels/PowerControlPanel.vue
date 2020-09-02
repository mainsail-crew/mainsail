<style>
</style>

<template>
    <div>
        <v-card>
            <v-toolbar flat dense>
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-power" left></v-icon>Power Control
                    </span>
                </v-toolbar-title>
            </v-toolbar>

            <v-card-text class="pb-0">
                <div v-for="(device, index) in devices" v-bind:key="index">
                    <v-divider class="my-2" v-if="index > 0"></v-divider>
                    <v-row class="pl-2 pr-2 pb-2">
                        <v-col class="col-auto py-0 vertical_align_center col-6">{{ device.name }}</v-col>
                        <v-col class="col-auto py-0 vertical_align_center col-6">
                            <v-btn
                                :disabled="device.status === 1"
                                v-on="device.status === 0 ? { click: () => setPower(index,1) } : {}"
                            >On</v-btn>
                            <v-btn
                                :disabled="device.status === 0"
                                v-on="device.status === 1 ? { click: () => setPower(index,0) } : {}"
                            >Off</v-btn>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
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
            devices: (state) => state.power.devices,
        }),
    },
    methods: {
        setPower(index, value) {
            let rpc = value === 1 ? "post_power_on" : "post_power_off";
            let deviceId = this.devices[index].id;
            Vue.prototype.$socket.sendObj(
                rpc,
                { [deviceId]: "" },
                "responsePowerToggle"
            );
        },
    },
};
</script>