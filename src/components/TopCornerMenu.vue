<style scoped>
    .minheight30 {
        min-height: 30px;
    }
</style>

<template>
    <v-menu bottom left :offset-y="true" :close-on-content-click="false" v-model="showMenu">
        <template v-slot:activator="{ on, attrs }">
            <v-btn color="grey darken-3" v-bind="attrs" v-on="on" class="ml-5 minwidth-0 px-2">
                <v-icon>mdi-power-standby</v-icon>
            </v-btn>
        </template>

        <v-list dense>
            <v-subheader class="" style="height: auto;">{{ $t("App.KlipperControl") }}</v-subheader>
            <v-list-item class="minheight30" link @click="doRestart()">
                <v-list-item-title><v-icon class="mr-2" small>mdi-restart</v-icon>{{ $t("App.Restart") }}</v-list-item-title>
            </v-list-item>
            <v-list-item class="minheight30" link @click="doFirmwareRestart()">
                <v-list-item-title><v-icon class="mr-2" small>mdi-restart</v-icon>{{ $t("App.FirmwareRestart") }}</v-list-item-title>
            </v-list-item>
            <template v-if="services.length">
                <v-divider class="mt-0"></v-divider>
                <v-subheader class="pt-2" style="height: auto;">{{ $t("App.RestartServices") }}</v-subheader>
                <v-list-item class="minheight30"  link @click="doServiceRestart(service)" v-for="service in services" v-bind:key="service">
                    <v-list-item-title><v-icon class="mr-2" small>mdi-restart</v-icon>{{ service.charAt(0).toUpperCase() + service.slice(1) }}</v-list-item-title>
                </v-list-item>
            </template>
            <div v-if="countPowerDevices">
                <v-divider class="mt-0"></v-divider>
                <v-subheader class="pt-2" style="height: auto;">{{ $t("App.PowerDevices") }}</v-subheader>
                <v-list-item v-for="(device, index) in devices" v-bind:key="index" class="minheight30" @click="changeSwitch(device, device.status)" :disabled="(device.status === 'error' || device.locked_while_printing && ['printing', 'paused'].includes(printer_state))">
                    <v-list-item-title>
                        <v-icon class="mr-2" :color="device.status === 'on' ? '' : 'grey darken-2'">mdi-{{ device.status === 'on' ? 'toggle-switch' : 'toggle-switch-off' }}</v-icon>{{ device.device }}
                    </v-list-item-title>
                </v-list-item>
            </div>
            <v-divider class="mt-0"></v-divider>
            <v-subheader class="pt-2" style="height: auto;">{{ $t("App.HostControl") }}</v-subheader>
            <v-list-item class="minheight30" link @click="doHostReboot()">
                <v-list-item-title><v-icon class="mr-2" small>mdi-power</v-icon>{{ $t("App.Reboot") }}</v-list-item-title>
            </v-list-item>
            <v-list-item class="minheight30" link @click="doHostShutdown()">
                <v-list-item-title><v-icon class="mr-2" small>mdi-power</v-icon>{{ $t("App.Shutdown") }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
import {mapState} from "vuex";
import Vue from "vue";

export default {
    name: "TopCornerMenu.vue",
    data: function () {
        return {
            showMenu: false,
        }
    },
    computed: {
        ...mapState({
            printer_state: state => state.printer.print_stats.state,
            devices: (state) => state.server.power.devices,
        }),
        countPowerDevices() {
            return this.$store.getters["server/power/count"]
        },
        boolWebcam() {
            return this.$store.state.gui.dashboard.boolWebcam || this.$store.state.gui.webcam.bool
        },
        services() {
            let services = this.$store.state.server.system_info.available_services
            services.sort()
            return services
        }
    },
    methods: {
        changeSwitch(device, value) {
            this.setPower(device, (value === 'off') ? 1 : 0)
        },
        setPower(device, value) {
            let rpc = value === 1 ? "machine.device_power.on" : "machine.device_power.off"
            Vue.prototype.$socket.sendObj(rpc,{ [device.device]: null },"server/power/responseToggle")
        },
        doRestart() {
            this.showMenu = false
            this.$store.commit('server/addEvent', { message: "RESTART", type: 'command' })
            this.$socket.sendObj('printer.gcode.script', { script: "RESTART" })
        },
        doFirmwareRestart() {
            this.showMenu = false
            this.$store.commit('server/addEvent', { message: "FIRMWARE_RESTART", type: 'command' })
            this.$socket.sendObj('printer.gcode.script', { script: "FIRMWARE_RESTART" })
        },
        doServiceRestart(service) {
            this.showMenu = false
            this.$socket.sendObj('machine.services.restart', { service: service })
        },
        doHostReboot() {
            this.showMenu = false
            this.$socket.sendObj('machine.reboot', { })
        },
        doHostShutdown() {
            this.showMenu = false
            this.$socket.sendObj('machine.shutdown', { })
        },
    }
}
</script>