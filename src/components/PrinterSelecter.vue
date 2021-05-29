<style scoped>

</style>

<template>
    <div v-if="(remoteMode && countPrinters > 1) || (!remoteMode && countPrinters)">
        <li :class="currentPage === '/allPrinters' ? 'nav-item active' : 'nav-item '">
            <div
                class="nav-link "
                @click.prevent
                @click="switchToPrinters"
                role="button"
            >
                <v-icon>mdi-view-dashboard-outline</v-icon>
                <span class="nav-title">{{ $t("App.Printers")}}</span>

                <v-menu bottom :offset-x="true">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon class="nav-arrow right" v-bind="attrs" v-on="on" >mdi-chevron-down</v-icon>
                    </template>

                    <v-list dense>
                        <v-list-item two-line v-for="printer in printers" v-bind:key="printer._namespace" @click="changePrinter(printer)" :disabled="!printer.socket.isConnected" link>
                            <v-list-item-content>
                                <v-list-item-title>{{ getPrinterName(printer._namespace) }}</v-list-item-title>
                                <v-list-item-subtitle>{{ getPrinterDescription(printer)}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
            <v-item-group class="v-btn-toggle mx-4 d-block row" name="printers" v-if="false">
                <v-btn class="col" color="primary" @click="switchToPrinters">{{ $t("App.Printers")}}</v-btn>
            </v-item-group>
        </li>
        <v-divider class="my-4"></v-divider>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import router from "@/plugins/router";

export default {
    name: "PrinterSelecter.vue",
    computed: {
        ...mapState({
            remoteMode: state => state.socket.remoteMode
        }),
        countPrinters: {
            get() {
                return this.$store.getters["farm/countPrinters"]
            }
        },
        printers: {
            get() {
                return this.$store.getters["farm/getPrinters"]
            }
        },
        currentPage: function() {
            return this.$route.fullPath;
        },
    },
    methods: {
        switchToPrinters() {
            router.push("/allPrinters");
        },
        getPrinterName(namespace) {
            return this.$store.getters["farm/"+namespace+"/getPrinterName"]
        },
        getPrinterDescription(printer) {
            return this.$store.getters["farm/"+printer._namespace+"/getStatus"]
        },
        changePrinter(printer) {
            if (printer.socket.isConnected) {
                if (this.remoteMode) this.$store.dispatch('changePrinter', { printer: printer._namespace })
                else window.location.href = "//"+printer.socket.hostname+(parseInt(printer.socket.webPort) !== 80 ? ':'+printer.socket.webPort : '')
            }
        },

    }
}
</script>