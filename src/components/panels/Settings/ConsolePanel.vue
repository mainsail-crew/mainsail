<style>

</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-console-line</v-icon>Console</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="py-3">
            <v-container px-0 py-0>
                <v-row>
                    <v-col class="py-2">
                        <v-switch v-model="hideWaitTemperatures" label="Hide temperatures" hide-details class="mt-0"></v-switch>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="py-2">
                        <v-switch v-model="boolCustomFilters" label="Custom filter" hide-details class="mt-0"></v-switch>
                    </v-col>
                </v-row>
                <v-row v-if="boolCustomFilters">
                    <v-col class="py-2">
                        <v-textarea
                            outlined
                            label="Rules"
                            v-model="customFilters"
                            hide-details
                            class="mb-2"
                        ></v-textarea>
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
            hideWaitTemperatures: {
                get() {
                    return this.$store.state.gui.console.hideWaitTemperatures;
                },
                set(status) {
                    return this.$store.dispatch('gui/setSettings', { console: { hideWaitTemperatures: status } });
                }
            },
            boolCustomFilters: {
                get() {
                    return this.$store.state.gui.console.boolCustomFilters;
                },
                set(status) {
                    return this.$store.dispatch('gui/setSettings', { console: { boolCustomFilters: status } });
                }
            },
            customFilters: {
                get() {
                    return this.$store.state.gui.console.customFilters;
                },
                set(status) {
                    return this.$store.dispatch('gui/setSettings', { console: { customFilters: status } });
                }
            },
        },
        methods: {

        }
    }
</script>