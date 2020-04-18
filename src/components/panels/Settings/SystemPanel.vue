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
            <div><v-btn :href="'http://'+hostname+':'+port+'/printer/log'" color="primary"><v-icon class="mr-sm-2">mdi-download</v-icon>Download Log</v-btn></div>
            <div><v-btn @click="doRestart" :loading="loadingRestart" color="error" class="mt-3"><v-icon class="mr-sm-2">mdi-cached</v-icon>Restart</v-btn></div>
            <div><v-btn @click="doRestartFirmware" :loading="loadingRestartFirmware" class="mt-3" color="error"><v-icon class="mr-sm-2">mdi-cached</v-icon><span class="d-none d-sm-block">FW Restart</span></v-btn></div>
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
        }
    }
</script>