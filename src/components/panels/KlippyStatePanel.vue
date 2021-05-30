<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-alert-circle</v-icon>{{ $t('Panels.KlippyStatePanel.KlippyState')}}: {{ klippy_state}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <template v-if="klippy_connected">
            <v-card-text class="pt-3 pb-1">
                <pre style="white-space: pre-wrap;">{{ klippy_message }}</pre>
            </v-card-text>
            <v-divider class="mt-2"></v-divider>
            <v-card-actions class="py-4 px-5">
                <v-btn small @click="doRestart" color="error" class=""><v-icon class="mr-sm-2">mdi-restart</v-icon>{{ $t('Panels.KlippyStatePanel.Restart') }}</v-btn>
                <v-btn small @click="doRestartFirmware" class="ml-4" color="error"><v-icon class="mr-sm-2">mdi-restart</v-icon>{{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}</v-btn>
            </v-card-actions>
        </template>
        <template v-else>
            <v-card-text class="pt-5 pb-1">
                <connection-status :moonraker="true" :klipper="false"></connection-status>
                <p class="mt-2 mb-0 text-center">{{ $t('Panels.KlippyStatePanel.MoonrakerCannotConnect') }}</p>
                <v-divider class="my-2"></v-divider>
                <p class="mt-2">{{ $t('Panels.KlippyStatePanel.KlipperCheck') }}</p>
            </v-card-text>
        </template>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import ConnectionStatus from "@/components/ui/ConnectionStatus"

    export default {
        components: {
            ConnectionStatus
        },
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