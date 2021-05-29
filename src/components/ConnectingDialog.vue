<style scoped>

</style>

<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <v-card dark>
            <v-toolbar flat dense color="primary">
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-connection" left></v-icon>
                        <template v-if="connectingFailed">{{ $t("ConnectionDialog.Failed", {'host': formatHostname}) }}</template>
                        <template v-else-if="isConnecting">{{ $t("ConnectionDialog.Connecting", {'host': formatHostname}) }}</template>
                        <template v-else>{{ formatHostname }}</template>
                    </span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pt-5" v-if="isConnecting">
                <v-progress-linear color="white" indeterminate></v-progress-linear>
            </v-card-text>
            <v-card-text class="pt-5" v-if="!isConnecting && connectingFailed">
                <p>{{ $t("ConnectionDialog.CannotConnectTo", {'host': formatHostname}) }}</p>
                <div class="text-center">
                    <v-btn @click="reconnect" color="primary">{{ $t("ConnectionDialog.TryAgain") }}</v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import Vue from "vue";

export default {
    data: function() {
        return {

        }
    },
    computed: {
        protocol() {
            return this.$store.state.socket.protocol
        },
        hostname() {
            return this.$store.state.socket.hostname
        },
        port() {
            return this.$store.state.socket.port
        },
        formatHostname() {
            return parseInt(this.port) !== 80 && this.port !== "" ? this.hostname+":"+this.port : this.hostname
        },
        isConnected() {
            return this.$store.state.socket.isConnected
        },
        isConnecting() {
            return this.$store.state.socket.isConnecting
        },
        connectingFailed() {
            return this.$store.state.socket.connectingFailed
        },
        showDialog() {
            return !this.isConnected
        }
    },
    methods: {
        connect() {
            Vue.prototype.$socket.setUrl(this.protocol+"://"+this.hostname+":"+this.port+"/websocket")
            Vue.prototype.$socket.connect()
        },
        reconnect() {
            this.$store.dispatch('socket/setData', { connectingFailed: false })
            Vue.prototype.$socket.connect()
        }
    }
}
</script>