<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-tune</v-icon>{{ $t('Setting.ControlExtruder') }}</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pt-2 pb-0">
            <v-text-field
                :label="$t('Setting.FeedrateXY')"
                v-model="feedrateXY"
                type="number"
                suffix="mm/s"
            ></v-text-field>
            <v-text-field
                :label="$t('Setting.FeedrateZ')"
                v-model="feedrateZ"
                type="number"
                suffix="mm/s"
            ></v-text-field>
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
            feedrateXY: {
                get() {
                    return this.$store.state.gui.dashboard.control.feedrateXY
                },
                set(value) {
                    return this.$store.dispatch('gui/setSettings', { dashboard: { control: { feedrateXY: value } } })
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
        },
        methods: {

        }
    }
</script>