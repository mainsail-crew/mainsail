<style>

</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-view-dashboard</v-icon>Dashboard</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
            <v-container px-0 py-0>
                <v-row>
                    <v-col class="py-2">
                        <v-switch v-model="boolShowWebcamOnDashboard" label="Webcam" hide-details class="mt-0"></v-switch>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-2">
                        <v-switch v-model="boolShowTempchartOnDashboard" label="Tempchart" hide-details class="mt-0"></v-switch>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-2">
                        <v-switch v-model="boolShowConsoleOnDashboard" label="Console" hide-details class="mt-0"></v-switch>
                    </v-col>
                </v-row>
            </v-container>
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
                    return this.$store.dispatch('gui/setSettings', { dashboard: { boolWebcam: status } });
                }
            },
            boolShowTempchartOnDashboard: {
                get() {
                    return this.$store.state.gui.dashboard.boolTempchart;
                },
                set(status) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { boolTempchart: status } });
                }
            },
            boolShowConsoleOnDashboard: {
                get() {
                    return this.$store.state.gui.dashboard.boolConsole;
                },
                set(status) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { boolConsole: status } });
                }
            },
        },
        methods: {

        }
    }
</script>