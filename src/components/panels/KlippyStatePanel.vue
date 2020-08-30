<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey">
                <v-icon dark>mdi-alert-circle</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Klippy-Status</v-list-item-title>
                <v-list-item-title class="subtitle-1">{{ state }}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2" ></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-left"><pre>{{ state_message }}</pre></v-flex>
            </v-layout>
        </v-card-text>
        <v-divider class="my-2" ></v-divider>
        <v-card-text class="px-4 pt-2 pb-4 content text-center text-lg-left">
            <v-btn @click="doRestart" :loading="loadingRestart" color="error" class=""><v-icon class="mr-sm-2">mdi-cached</v-icon>Restart</v-btn>
            <v-btn @click="doRestartFirmware" :loading="loadingRestartFirmware" class="ml-4" color="error"><v-icon class="mr-sm-2">mdi-cached</v-icon>FIRMWARE_Restart</v-btn>
        </v-card-text>
    </v-card>
</template>

<script>
    import {mapMutations, mapState} from 'vuex';

    export default {
        computed: {
            ...mapState({
                state: state => state.printer.webhooks.state,
                state_message: state => state.printer.webhooks.state_message,
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
        },
    }
</script>

<style scoped>
    .equal-width {
        flex-basis: 0;
    }

    .category-header {
        flex: 0 0 100px;
    }
    a:not(:hover) {
        color: inherit;
    }

    .content span,
    .content strong {
        padding-left: 8px;
        padding-right: 8px;
        white-space: pre-wrap;
    }

    .probe-span {
        border-radius: 5px;
    }
    .probe-span:not(:last-child) {
        margin-right: 8px;
    }
</style>