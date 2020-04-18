
<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-view-dashboard</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Dashboard</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pb-0 pt-3 content">
            <v-row>
                <v-col class="px-10 py-0">
                    <v-switch v-model="boolShowWebcamOnDashboard" label="Webcam"></v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="px-10 py-0">
                    <v-switch v-model="boolShowTempchartOnDashboard" label="Tempchart"></v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="px-10 py-0">
                    <v-switch v-model="boolShowConsoleOnDashboard" label="Console"></v-switch>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            boolShowWebcamOnDashboard: {
                get() {
                    return this.$store.state.gui.dashboard.boolWebcam;
                },
                set(status) {
                    return this.$store.dispatch('setSettings', { gui: { dashboard: { boolWebcam: status } } });
                }
            },
            boolShowTempchartOnDashboard: {
                get() {
                    return this.$store.state.gui.dashboard.boolTempchart;
                },
                set(status) {
                    return this.$store.dispatch('setSettings', { gui: { dashboard: { boolTempchart: status } } });
                }
            },
            boolShowConsoleOnDashboard: {
                get() {
                    return this.$store.state.gui.dashboard.boolConsole;
                },
                set(status) {
                    return this.$store.dispatch('setSettings', { gui: { dashboard: { boolConsole: status } } });
                }
            },
        },
        methods: {

        }
    }
</script>