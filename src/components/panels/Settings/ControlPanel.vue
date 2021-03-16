<style>

</style>

<template>
    <v-form ref="formControlExtruder">
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
                                @blur="blurFeedrateXY"
                                type="number"
                                suffix="mm/s"
                                hide-details="auto"
                                :rules="[
                                    v => v > 0 || 'Minimum speed is 1'
                                ]"
                            ></v-text-field>
                        </v-col>
                        <v-col col-6>
                            <v-text-field
                                label="Speed Z"
                                v-model="feedrateZ"
                                @blur="blurFeedrateZ"
                                type="number"
                                suffix="mm/s"
                                hide-details="auto"
                                ref="feedrateZ"
                                :rules="[
                                    v => v > 1 || 'Minimum speed is 1'
                                ]"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="py-0">
                            <v-switch v-model="useCross" label="Enable movement cross" hide-details="auto" class="mt-0"></v-switch>
                        </v-col>
                    </v-row>
                    <template v-if="useCross">
                        <v-row>
                            <v-col>
                                <v-combobox
                                    label="Move distances in mm"
                                    v-model="stepsAll"
                                    hide-selected
                                    hide-details="auto"
                                    multiple
                                    small-chips
                                    :deletable-chips="true"
                                    append-icon=""
                                    type="number"
                                    :rules="[
                                        v => v.length > 0 || 'Minimum 1 value',
                                        v => v.length < 9 || 'For narrow screens it is recommended to enter max. 3 values.',
                                    ]"
                                ></v-combobox>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="pt-0">
                                <v-switch v-model="reverseX" label="Reverse X movement" hide-details="auto" class="mt-0"></v-switch>
                                <v-switch v-model="reverseY" label="Reverse Y movement" hide-details="auto" class="mt-0"></v-switch>
                                <v-switch v-model="reverseZ" label="Reverse Z movement" hide-details="auto" class="mt-0"></v-switch>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-else>
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
                    </template>
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
    </v-form>
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
            reverseX: {
                get() {
                    return this.$store.state.gui.dashboard.control.reverseZ;
                },
                set(reverseX) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { reverseX } } })
                }
            },
            reverseY: {
                get() {
                    return this.$store.state.gui.dashboard.control.reverseZ;
                },
                set(reverseY) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { reverseY } } })
                }
            },
            reverseZ: {
                get() {
                    return this.$store.state.gui.dashboard.control.reverseZ;
                },
                set(reverseZ) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { reverseZ } } })
                }
            },
            useCross: {
                get() {
                    return this.$store.state.gui.dashboard.control.useCross;
                },
                set(useCross) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { useCross } } })
                }
            },
            feedrateXY: {
                get() {
                    return this.$store.state.gui.dashboard.control.feedrateXY
                },
                set(feedrate) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { feedrateXY: feedrate } } })
                }
            },
            stepsAll: {
                get() {
                    const steps = this.$store.state.gui.dashboard.control.stepsAll
                    return (steps ?? []).sort(function (a,b) { return b-a })
                },
                set(steps) {
                    const absSteps = []
                    for(const value of steps) absSteps.push(Math.abs(value))
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { stepsAll: absSteps } } })
                }
            },
            stepsXY: {
                get() {
                    const steps = this.$store.state.gui.dashboard.control.stepsXY
                    return steps.sort(function (a,b) { return b-a })
                },
                set(steps) {
                    const absSteps = []
                    for(const value of steps) absSteps.push(Math.abs(value))
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { stepsXY: absSteps } } })
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
                set(steps) {
                    const absSteps = []
                    for(const value of steps) absSteps.push(Math.abs(value))
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { stepsZ: absSteps } } })
                }
            },
            feedamountsE: {
                get() {
                    const steps = this.$store.state.gui.dashboard.extruder.feedamounts
                    return steps.sort(function (a,b) { return b-a })
                },
                set(amounts) {
                    const absAmounts = []
                    for(const value of amounts) absAmounts.push(Math.abs(value))
                    return this.$store.dispatch('gui/setSettings', { dashboard: { extruder: { feedamounts: absAmounts } } })
                }
            },
            feedratesE: {
                get() {
                    const steps = this.$store.state.gui.dashboard.extruder.feedrates
                    return steps.sort(function (a,b) { return b-a })
                },
                set(rates) {
                    const absRates = []
                    for(const value of rates) absRates.push(Math.abs(value))
                    return this.$store.dispatch('gui/setSettings', { dashboard: { extruder: { feedrates: absRates } } })
                }
            },
        },
        mounted() {
            this.$refs.formControlExtruder.validate()
        },
        methods: {
            blurFeedrateXY() {
                if (!(this.feedrateXY > 0)) this.feedrateXY = 100
            },
            blurFeedrateZ() {
                if (!(this.feedrateZ > 0)) this.feedrateZ = 25
            }
        }
    }
</script>
