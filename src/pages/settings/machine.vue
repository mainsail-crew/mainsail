<template>
    <div>
        <v-row>
            <v-col class="col-12 col-sm-6">
                <settings-config-files-panel></settings-config-files-panel>
            </v-col>
            <v-col class="col-12 col-sm-6">
                <v-row v-if="klippy_state === 'ready'">
                    <v-col class="col-12 pt-0">
                        <settings-limits-panel></settings-limits-panel>
                    </v-col>
                </v-row>
                <v-row v-if="klippy_state !== 'ready'">
                    <v-col class="col-12 pt-0">
                        <klippy-state-panel></klippy-state-panel>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="col-md-6" v-if="klippy_state === 'ready'">
                        <settings-endstop-panel></settings-endstop-panel>
                        <settings-runout-panel></settings-runout-panel>
                    </v-col>
                    <v-col :class="(klippy_state !== 'ready' ? 'col-md-12' : 'col-md-6')">
                        <settings-logfiles-panel></settings-logfiles-panel>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row>
        </v-row>
    </div>
</template>
<script>
    import {mapState} from "vuex";

    export default {
        data: () => ({

        }),
        computed: {
            ...mapState({
                klippy_state: state => state.printer.webhooks.state,
            }),
        },
        created() {

        },
        watch: {

        }
    }
</script>