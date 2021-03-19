<template>
    <v-row>
        <v-col class="col-sm-12 col-md-5">
            <min-settings-panel v-if="klippy_state === 'ready' && existsPrinterConfig"></min-settings-panel>
            <moonraker-failed-components-panel v-if="moonrakerFailedComponents.length"></moonraker-failed-components-panel>
            <klippy-state-panel v-if="socket_connected && klippy_state !== 'ready'"></klippy-state-panel>
            <status-panel v-if="klippy_state === 'ready'"></status-panel>
            <webcam-panel class="mt-6" v-if="showDashboardWebcam"></webcam-panel>
            <z-offset-panel class="mt-6" v-if="klippy_state === 'ready'"></z-offset-panel>
            <control-panel class="mt-6" v-if="klippy_state === 'ready'"></control-panel>
            <miscellaneous-panel v-if="klippy_state === 'ready'"></miscellaneous-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-7" v-if="klippy_connected">
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
                moonrakerFailedComponents: state => state.server.failed_components,

                showDashboardWebcam: state => state.gui.dashboard.boolWebcam,
                showDashboardConsole: state => state.gui.dashboard.boolConsole,
                config: state => state.printer.configfile.config,
            }),
            existsPrinterConfig: {
                get() {
                    return this.$store.getters["printer/existPrinterConfig"]
                }
            }
        },
    }
</script>