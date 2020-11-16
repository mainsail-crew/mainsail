<template>
    <v-row>
        <v-col class="col-sm-12 col-md-7">
            <min-settings-panel v-if="klippy_state === 'ready' && configExists"></min-settings-panel>
            <status-panel v-if="klippy_state === 'ready'"></status-panel>
            <klippy-state-panel v-if="socket_connected && klippy_state !== 'ready'"></klippy-state-panel>
            <webcam-panel v-if="showDashboardWebcam" class="mt-6"></webcam-panel>
            <z-offset-panel class="mt-6" v-if="klippy_state === 'ready'"></z-offset-panel>
            <control-panel class="mt-6" v-if="klippy_state === 'ready'"></control-panel>
            <extruder-panel class="mt-6" v-if="klippy_state === 'ready'"></extruder-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-5">
            <tools-panel v-if="socket_connected && klippy_connected"></tools-panel>
            <peripherie-panel class="mt-6" v-if="klippy_state === 'ready'"></peripherie-panel>
            <miniconsole-panel class="mt-6" v-if="klippy_state === 'ready' && showDashboardConsole"></miniconsole-panel>
            <power-control-panel class="mt-6" v-if="powerDevicesCount > 0"></power-control-panel>
        </v-col>
    </v-row>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import ZOffsetPanel from "../components/panels/ZOffsetPanel";

    export default {
        components: { ZOffsetPanel },
        data: () => ({
            configExists: false
        }),
        computed: {
            ...mapState({
                socket_connected: state => state.socket.isConnected,
                klippy_connected: state => state.server.klippy_connected,
                klippy_state: state => state.server.klippy_state,

                showDashboardConsole: state => state.gui.dashboard.boolConsole,
                config: state => state.printer.configfile.config,
            }),
            ...mapGetters({
                showDashboardWebcam: 'showDashboardWebcam',
                powerDevicesCount: 'server/powerDevices/count',
                existPrinterConfig: 'existPrinterConfig'
            })
        },
        created() {

        },
        watch: {
            config: {
                deep: true,
                handler() {
                    this.configExists = this.$store.getters.existPrinterConfig;
                }
            }
        }
    }
</script>