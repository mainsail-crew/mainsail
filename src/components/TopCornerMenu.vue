<template>
    <v-menu bottom left :offset-y="true" :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
            <v-btn dark icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
        </template>

        <v-list dense>
            <v-subheader>Klipper Control</v-subheader>
            <v-list-item link @click="doRestart()">
                <v-list-item-title><v-icon class="mr-3">mdi-sync</v-icon>Restart</v-list-item-title>
            </v-list-item>
            <v-list-item link @click="doFirmwareRestart()">
                <v-list-item-title><v-icon class="mr-3">mdi-sync</v-icon>Firmware Restart</v-list-item-title>
            </v-list-item>
            <div v-if="countPowerDevices">
                <v-divider class="mt-2"></v-divider>
                <v-subheader>Power Devices</v-subheader>
                <v-list-item v-for="(device, index) in devices" v-bind:key="index" @click="changeSwitch(device, device.status)" :disabled="(device.status === 'error')">
                    <v-list-item-title>
                        <v-icon class="mr-3">mdi-{{ device.status === 'on' ? 'toggle-switch' : 'toggle-switch-off' }}</v-icon>{{ device.device }}
                    </v-list-item-title>
                </v-list-item>
            </div>
            <v-divider class="mt-2"></v-divider>
            <v-subheader>Host Control</v-subheader>
            <v-list-item link @click="doHostReboot()">
                <v-list-item-title><v-icon class="mr-3">mdi-power</v-icon>Reboot</v-list-item-title>
            </v-list-item>
            <v-list-item link @click="doHostShutdown()">
                <v-list-item-title><v-icon class="mr-3">mdi-power</v-icon>Shutdown</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
import {mapState} from "vuex";
import Vue from "vue";

export default {
    name: "TopCornerMenu.vue",
    computed: {
        ...mapState({
            devices: (state) => state.server.power.devices,
        }),
        countPowerDevices: {
            get() {
                return this.$store.getters["server/power/count"]
            }
        },
    },
    methods: {
        changeSwitch(device, value) {
            this.setPower(device, (value === 'off') ? 1 : 0)
        },
        setPower(device, value) {
            let rpc = value === 1 ? "machine.device_power.on" : "machine.device_power.off"
            Vue.prototype.$socket.sendObj(rpc,{ [device.device]: null },"server/power/responseToggle")
        },
        doRestart: function() {
            this.$store.commit('server/addEvent', "RESTART")
            this.$socket.sendObj('printer.gcode.script', { script: "RESTART" })
        },
        doFirmwareRestart: function() {
            this.$store.commit('server/addEvent', "FIRMWARE_RESTART")
            this.$socket.sendObj('printer.gcode.script', { script: "FIRMWARE_RESTART" })
        },
        doHostReboot: function() {
            this.$socket.sendObj('machine.reboot', { })
        },
        doHostShutdown: function() {
            this.$socket.sendObj('machine.shutdown', { })
        },
    }
}
</script>

<style scoped>

</style>