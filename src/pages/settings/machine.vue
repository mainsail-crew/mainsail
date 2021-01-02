<template>
    <v-container fluid py-0 px-0>
        <v-row>
            <v-col class="col-12 col-sm-6">
                <settings-config-files-panel></settings-config-files-panel>
            </v-col>
            <v-col class="col-12 col-sm-6">
                <settings-limits-panel v-if="klippy_state === 'ready'"></settings-limits-panel>
                <klippy-state-panel v-if="klippy_state !== 'ready'"></klippy-state-panel>
                <settings-update-panel v-if="updateManager" class="mt-6"></settings-update-panel>
                <v-row class="mt-6">
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
    </v-container>
</template>
<script>
    import {mapState} from "vuex";

    export default {
        data: () => ({

        }),
        computed: {
            ...mapState({
                klippy_state: state => state.server.klippy_state,
            }),
            updateManager:{
                get() {
                    return this.$store.state.server.plugins.includes('update_manager')
                }
            }
        },
        created() {

        },
        watch: {

        }
    }
</script>