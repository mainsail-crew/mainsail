<style>
    .settings_dashboard_switch .v-messages {
        display: none;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-view-dashboard</v-icon>Dashboard</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="py-3">
            <v-row>
                <v-col class="py-0">
                    <v-switch v-model="boolShowWebcamOnDashboard" label="Webcam" class="settings_dashboard_switch mt-0"></v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="py-0">
                    <v-switch v-model="boolShowTempchartOnDashboard" label="Tempchart" class="settings_dashboard_switch mt-0"></v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="py-0">
                    <v-switch v-model="boolShowConsoleOnDashboard" label="Console" class="settings_dashboard_switch mt-0"></v-switch>
                </v-col>
            </v-row>
            <v-row v-if="boolShowScaleSetting">
                <v-col class="py-0">
                    <v-switch v-model="boolShowScaleOnDashboard" label="Scale" class="settings_dashboard_switch mt-0"></v-switch>
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
            boolShowScaleOnDashboard: {
                get() {
                    return this.$store.state.gui.dashboard.boolScale;
                },
                set(status) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { boolScale: status } });
                }
            },
            boolShowScaleSetting: {
                get() {
                    return this.$store.state.gui.dashboard.boolScaleAvailable;
                }
            },
        },
        methods: {

        }
    }
</script>