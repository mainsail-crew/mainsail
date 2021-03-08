<style scoped>

</style>

<template>
    <v-dialog v-model="showDialog" persistent :width="400">
        <v-card dark>
            <v-toolbar flat dense color="primary">
                <v-toolbar-title>
                    <span class="subheading">
                        <v-icon class="mdi mdi-connection" left></v-icon>Connecting<span v-if="connectingFailed"> failed</span><span v-if="isConnecting"> to {{ parseInt(port) !== 80 && port !== "" ? hostname+":"+port : hostname }}</span>
                    </span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pt-5" v-if="isConnecting">
                <v-progress-linear color="white" indeterminate></v-progress-linear>
            </v-card-text>
            <v-card-text class="pt-5" v-if="!isConnecting && connectingFailed">
                <p>Cannot not connect to {{ parseInt(port) !== 80 && port !== "" ? hostname+":"+port : hostname }}.</p>
                <div class="text-center">
                    <v-btn @click="reconnect" color="primary">try again</v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapState } from "vuex";
import Vue from "vue";

export default {
    data: function() {
        return {
            showDialog: true,
        }
    },
    computed: {
        ...mapState({
            isConnected: state => state.socket.isConnected,
            isConnecting: state => state.socket.isConnecting,
            connectingFailed: state => state.socket.connectingFailed,
        }),
        protocol: {
            get() {
                return this.$store.state.socket.protocol
            }
        },
        hostname: {
            get() {
                return this.$store.state.socket.hostname
            },
            set(newName) {
                return this.$store.dispatch('socket/setData', { hostname: newName });
            }
        },
        port: {
            get() {
                return this.$store.state.socket.port
            },
            set(newName) {
                return this.$store.dispatch('socket/setData', { port: newName });
            }
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
    },
    mounted() {
        this.tmpHostname = this.hostname+":"+this.port
    },
    watch: {
        isConnected(newVal) {
            this.showDialog = !newVal
        }
    }
}
</script>