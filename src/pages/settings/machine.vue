<template>
    <div>
        <v-row>
            <v-col class="col-sm-12 col-md-6">
                <settings-config-files-panel></settings-config-files-panel>
            </v-col>
            <v-col class="col-sm-12 col-md-6">
                <v-row>
                    <v-col class="col-sm-12 pt-0" v-if="klippy_state === 'ready'">
                        <settings-limits-panel></settings-limits-panel>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="col-sm-12 col-md-6" v-if="klippy_state === 'ready'">
                        <settings-endstop-panel></settings-endstop-panel>
                        <settings-runout-panel></settings-runout-panel>
                    </v-col>
                    <v-col :class="'col-sm-12 col-md-6 '+(klippy_state !== 'ready' ? 'pt-0' : '')">
                        <settings-system-panel></settings-system-panel>
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