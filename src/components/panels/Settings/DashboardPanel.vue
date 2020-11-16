<style>
    .settings_dashboard_switch .v-messages {
        display: none;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-view-dashboard</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Dashboard</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-3 content">
            <v-row>
                <v-col class="px-10 py-0">
                    <v-switch v-model="boolShowWebcamOnDashboard" label="Webcam" class="settings_dashboard_switch mt-0"></v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="px-10 py-0">
                    <v-switch v-model="boolShowTempchartOnDashboard" label="Tempchart" class="settings_dashboard_switch mt-0"></v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="px-10 py-0">
                    <v-switch v-model="boolShowConsoleOnDashboard" label="Console" class="settings_dashboard_switch mt-0"></v-switch>
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
        },
        methods: {

        }
    }
</script>