<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <div>
        <v-card>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-tune</v-icon>Control</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pa-0">
                <v-container>
                    <v-row>
                        <v-col col-6>
                            <v-text-field
                                label="Speed XY"
                                v-model="feedrateXY"
                                type="number"
                                suffix="mm/s"
                                hide-details="auto"
                            ></v-text-field>
                        </v-col>
                        <v-col col-6>
                            <v-text-field
                                label="Speed Z"
                                v-model="feedrateZ"
                                type="number"
                                suffix="mm/s"
                                hide-details="auto"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-combobox
                                label="Move distances XY in mm"
                                v-model="stepsXY"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || 'Minimum 1 value',
                                    v => v.length < 4 || 'For narrow screens it is recommended to enter max. 3 values.',
                                ]"
                            ></v-combobox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-combobox
                                label="Move distances Z in mm"
                                v-model="stepsZ"
                                :items="defaultStepsZ"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || 'Minimum 1 value',
                                    v => v.length < 4 || 'For narrow screens it is recommended to enter max. 3 values.',
                                ]"
                            ></v-combobox>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
        <v-card class="mt-6">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-tune</v-icon>Extruder</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pa-0">
                <v-container>
                    <v-row>
                        <v-col>
                            <v-combobox
                                label="Move distances E in mm"
                                v-model="feedamountsE"
                                :items="defaultFeedamounts"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || 'Minimum 1 value',
                                    v => v.length < 6 || 'For narrow screens it is recommended to enter max. 5 values.',
                                ]"
                            ></v-combobox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-combobox
                                label="Speed E in mm/s"
                                v-model="feedratesE"
                                :items="defaultFeedrates"
                                hide-selected
                                hide-details="auto"
                                multiple
                                small-chips
                                :deletable-chips="true"
                                append-icon=""
                                type="number"
                                :rules="[
                                    v => v.length > 0 || 'Minimum 1 value',
                                    v => v.length < 6 || 'For narrow screens it is recommended to enter max. 5 values.',
                                ]"
                            ></v-combobox>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    export default {
        components: {

        },
        data: function() {
            return {
                defaultStepsXY: [100,10,1],
                defaultStepsZ: [25,1,0.1],
                defaultFeedamounts: [ 50, 25, 10, 5, 1 ],
                defaultFeedrates: [ 60, 30, 15, 5, 1 ],
            }
        },
        computed: {
            feedrateXY: {
                get() {
                    return this.$store.state.gui.dashboard.control.feedrateXY
                },
                set(value) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { feedrateXY: value } } })
                }
            },
            stepsXY: {
                get() {
                    const steps = this.$store.state.gui.dashboard.control.stepsXY
                    return steps.sort(function (a,b) { return b-a })
                },
                set(value) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { stepsXY: value } } })
                }
            },
            feedrateZ: {
                get() {
                    return this.$store.state.gui.dashboard.control.feedrateZ
                },
                set(value) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { feedrateZ: value } } })
                }
            },
            stepsZ: {
                get() {
                    const steps = this.$store.state.gui.dashboard.control.stepsZ
                    return steps.sort(function (a,b) { return b-a })
                },
                set(value) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { stepsZ: value } } })
                }
            },
            feedamountsE: {
                get() {
                    const steps = this.$store.state.gui.dashboard.extruder.feedamounts
                    return steps.sort(function (a,b) { return b-a })
                },
                set(value) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { extruder: { feedamounts: value } } })
                }
            },
            feedratesE: {
                get() {
                    const steps = this.$store.state.gui.dashboard.extruder.feedrates
                    return steps.sort(function (a,b) { return b-a })
                },
                set(value) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { extruder: { feedrates: value } } })
                }
            },
        },
        methods: {

        }
    }
</script>