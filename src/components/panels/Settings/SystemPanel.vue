<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-cpu-64-bit</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">System</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="">
            <div><v-btn :href="'http://'+hostname+':'+port+'/printer/klippy.log'" color="primary"><v-icon class="mr-sm-2">mdi-download</v-icon>Klipper Log</v-btn></div>
            <div><v-btn :href="'http://'+hostname+':'+port+'/server/moonraker.log'" color="mt-3 primary"><v-icon class="mr-sm-2">mdi-download</v-icon>Moonraker Log</v-btn></div>
            <div><v-btn @click="doRestart" :loading="loadingRestart" color="error" class="mt-3"><v-icon class="mr-sm-2">mdi-cached</v-icon>Restart</v-btn></div>
            <div><v-btn @click="doRestartFirmware" :loading="loadingRestartFirmware" class="mt-3" color="error"><v-icon class="mr-sm-2">mdi-cached</v-icon><span class="d-none d-sm-block">FW Restart</span></v-btn></div>
            <div><v-btn @click="doRebootHost" :loading="loadingRebootHost" class="mt-3" color="error"><v-icon class="mr-sm-2">mdi-cached</v-icon><span class="d-none d-sm-block">Host Restart</span></v-btn></div>
            <div><v-btn @click="doShutdownHost" :loading="loadingShutdownHost" class="mt-3" color="error"><v-icon class="mr-sm-2">mdi-power</v-icon><span class="d-none d-sm-block">Host Shutdown</span></v-btn></div>
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
                this.$socket.sendObj('post_printer_restart', { }, "responseRestart");
            },
            doRestartFirmware() {
                this.$store.commit('setLoadingRestartFirmware', true);
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