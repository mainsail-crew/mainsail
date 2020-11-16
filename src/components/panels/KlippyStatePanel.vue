<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey">
                <v-icon dark>mdi-alert-circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Klippy-Status</v-list-item-title>
                <v-list-item-title class="subtitle-1">{{ klippy_state }}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2" ></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-left" v-if="klippy_connected"><pre>{{ klippy_message }}</pre></v-flex>
                <v-flex col class="text-left" v-if="!klippy_connected">
                    <p>Moonraker can't connect to Klippy!<br />Please check if the Klipper service is running and an UDS (Unix Domain Socket) is configured.</p>
                </v-flex>
            </v-layout>
        </v-card-text>
        <v-divider class="my-2" v-if="klippy_connected" ></v-divider>
        <v-card-text class="px-4 pt-2 pb-4 content text-center text-lg-left" v-if="klippy_connected">
            <v-btn @click="doRestart" color="error" class=""><v-icon class="mr-sm-2">mdi-cached</v-icon>Restart</v-btn>
            <v-btn @click="doRestartFirmware" class="ml-4" color="error"><v-icon class="mr-sm-2">mdi-cached</v-icon>FIRMWARE_Restart</v-btn>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        computed: {
            ...mapState({
                klippy_connected: state => state.server.klippy_connected,
                klippy_state: state => state.server.klippy_state,
                klippy_message: state => state.server.klippy_message,
            }),
        },
        methods: {

            doRestart() {
                // TODO loading restart button
                //this.$store.commit('setLoadingRestart', true);
                this.$socket.sendObj('printer.restart', { });
            },
            doRestartFirmware() {
                // TODO loading fw restart button
                //this.$store.commit('setLoadingRestartFirmware', true);
                this.$socket.sendObj('printer.firmware_restart', { });
            },
        },
    }
</script>