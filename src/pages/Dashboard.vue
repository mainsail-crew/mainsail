<template>
    <v-row>
        <v-col class="col-sm-12 col-md-5">
            <min-settings-panel v-if="klippy_state === 'ready' && existsPrinterConfig"></min-settings-panel>
            <status-panel v-if="klippy_state === 'ready'"></status-panel>
            <klippy-state-panel v-if="socket_connected && klippy_state !== 'ready'"></klippy-state-panel>
            <webcam-panel v-if="showDashboardWebcam" class="mt-6"></webcam-panel>
            <div v-for="profile in this.$store.state.gui.preheatbutton.profiles" :key="profile.id">
                <preheat-panel class="mt-6" :profile="profile"></preheat-panel>
            </div>
            <scale-panel v-if="showDashboardScale" class="mt-6"></scale-panel>
            <neopixel-panel v-if="this.$store.state.gui.neopixelcenter.stripname!=''" class="mt-6"></neopixel-panel>
            <z-offset-panel class="mt-6" v-if="klippy_state === 'ready'"></z-offset-panel>
            <control-panel class="mt-6" v-if="klippy_state === 'ready'"></control-panel>
            <extruder-panel class="mt-6" v-if="klippy_state === 'ready'"></extruder-panel>
            <peripherie-panel class="mt-6" v-if="klippy_state === 'ready'"></peripherie-panel>
            <power-control-panel class="mt-6" v-if="countPowerDevices > 0"></power-control-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-7">
            <tools-panel v-if="socket_connected && klippy_connected"></tools-panel>
            <miniconsole-panel class="mt-6" v-if="klippy_state === 'ready' && showDashboardConsole"></miniconsole-panel>
        </v-col>
    </v-row>
</template>

<script>
    import { mapState } from 'vuex'
    import ZOffsetPanel from "../components/panels/ZOffsetPanel";

    export default {
        components: { ZOffsetPanel },
        data: () => ({

        }),
        computed: {
            ...mapState({
                socket_connected: state => state.socket.isConnected,
                klippy_connected: state => state.server.klippy_connected,
                klippy_state: state => state.server.klippy_state,

                showDashboardWebcam: state => state.gui.dashboard.boolWebcam,
                showDashboardScale: state => state.gui.dashboard.boolScale,
                showDashboardConsole: state => state.gui.dashboard.boolConsole,
                config: state => state.printer.configfile.config,
            }),
            countPowerDevices: {
                get() {
                    return this.$store.getters["server/power/count"]
                }
            },
            existsPrinterConfig: {
                get() {
                    return this.$store.getters["printer/existPrinterConfig"]
                }
            }
        },
    }
</script>