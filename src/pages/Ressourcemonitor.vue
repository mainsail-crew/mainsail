<template>
    <v-row>
        <v-col class="col-sm-12 col-md-5">
            <ressoucemonitor-hardwareinfo></ressoucemonitor-hardwareinfo>
        </v-col>
    </v-row>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        components: { },
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