<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-alert-circle</v-icon>{{ $t('Panels.KlippyStatePanel.KlippyState')}}: {{ klippy_state}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="py-0">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-left" v-if="klippy_connected"><pre style="white-space: pre-wrap;">{{ klippy_message }}</pre></v-flex>
                <v-flex col class="text-left" v-if="!klippy_connected">
                    <p style="white-space:pre-wrap">{{ $t('Panels.KlippyStatePanel.KlippyInfo') }}</p>
                </v-flex>
            </v-layout>
        </v-card-text>
        <v-divider class="my-2" v-if="klippy_connected" ></v-divider>
        <v-card-text class="px-4 pt-2 pb-4 content text-center text-lg-left" v-if="klippy_connected">
            <v-btn small @click="doRestart" color="error" class=""><v-icon class="mr-sm-2">mdi-restart</v-icon>{{ $t('Panels.KlippyStatePanel.Restart') }}</v-btn>
            <v-btn small @click="doRestartFirmware" class="ml-4" color="error"><v-icon class="mr-sm-2">mdi-restart</v-icon>{{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}</v-btn>
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
                this.$store.commit('socket/addLoading', { name: 'restart' });
                this.$socket.sendObj('printer.restart', { }, 'socket/removeLoading', { name: 'restart' });
            },
            doRestartFirmware() {
                this.$store.commit('socket/addLoading', { name: 'firmwareRestart' });
                this.$socket.sendObj('printer.firmware_restart', { }, 'socket/removeLoading', { name: 'firmwareRestart' });
            },
        },
    }
</script>