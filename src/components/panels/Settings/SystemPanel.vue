<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-cpu-64-bit</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">System</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class=" text-center text-lg-left">
            <div><v-btn :href="'http://'+hostname+':'+port+'/server/files/klippy.log'" block color="primary"><v-icon class="mr-2">mdi-download</v-icon>Klipper Log</v-btn></div>
            <div><v-btn :href="'http://'+hostname+':'+port+'/server/files/moonraker.log'" block color="mt-3 primary"><v-icon class="mr-2">mdi-download</v-icon>Moonraker Log</v-btn></div>
            <div><v-btn @click="doRestart" block :loading="loadingRestart" color="error" class="mt-3"><v-icon class="mr-2">mdi-cached</v-icon>Restart</v-btn></div>
            <div><v-btn @click="doRestartFirmware" block :loading="loadingRestartFirmware" class="mt-3" color="error"><v-icon class="mr-2">mdi-cached</v-icon>FW <span class="d-none d-sm-block">Restart</span></v-btn></div>
            <div><v-btn @click="doRebootHost" block :loading="loadingRebootHost" class="mt-3" color="error"><v-icon class="mr-2">mdi-cached</v-icon><span class="d-none d-sm-block">Host</span> Reboot</v-btn></div>
            <div><v-btn @click="doShutdownHost" block :loading="loadingShutdownHost" class="mt-3" color="error"><v-icon class="mr-2">mdi-power</v-icon><span class="d-none d-sm-block">Host</span> Shutdown</v-btn></div>
        </v-card-text>
    </v-card>
</template>

<script>
    import {mapMutations, mapState} from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                hostname: state => state.socket.hostname,
                port: state => state.socket.port,
                loadingRestart: state => state.socket.loadingRestart,
                loadingRestartFirmware: state => state.socket.loadingRestartFirmware,
                loadingRebootHost: state => state.socket.loadingRebootHost,
                loadingShutdownHost: state => state.socket.loadingShutdownHost,
            }),
            ...mapMutations([
                'setLoadingRestart',
                'setLoadingRestartFirmware',
            ]),
        },
        methods: {
            doRestart() {
                this.$store.commit('setLoadingRestart', true);
                this.$store.commit('setPrinterData', {
                    webhooks: {
                        state: 'shutdown',
                        state_message: 'RESTART'
                    }
                });
                this.$socket.sendObj('post_printer_restart', { }, "responseRestart");
            },
            doRestartFirmware() {
                this.$store.commit('setLoadingRestartFirmware', true);
                this.$store.commit('setPrinterData', {
                    webhooks: {
                        state: 'shutdown',
                        state_message: 'FIRMWARE RESTART'
                    }
                });
                this.$socket.sendObj('post_printer_firmware_restart', { }, "responseRestartFirmware");
            },
            doRebootHost() {
                this.$store.commit('setLoadingRebootHost', true);
                this.$socket.sendObj('post_machine_reboot', { });
            },
            doShutdownHost() {
                this.$store.commit('setLoadingShutdownHost', true);
                this.$socket.sendObj('post_machine_shutdown', { });
            },
        }
    }
</script>