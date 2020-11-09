<template>
    <v-row>
        <v-col class="col-sm-12 col-md-7">
            <min-settings-panel v-if="klippy_state === 'ready' && configExists"></min-settings-panel>
            <status-panel v-if="klippy_state === 'ready'"></status-panel>
            <klippy-state-panel v-if="klippy_state !== 'ready'"></klippy-state-panel>
            <webcam-panel v-if="showDashboardWebcam" class="mt-6"></webcam-panel>
            <z-offset-panel class="mt-6" v-if="klippy_state === 'ready'"></z-offset-panel>
            <control-panel class="mt-6" v-if="klippy_state === 'ready'"></control-panel>
            <extruder-panel class="mt-6" v-if="klippy_state === 'ready'"></extruder-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-5">
            <tools-panel></tools-panel>
            <peripherie-panel class="mt-6" v-if="klippy_state === 'ready'"></peripherie-panel>
            <miniconsole-panel class="mt-6" v-if="klippy_state === 'ready' && showDashboardConsole"></miniconsole-panel>
            <power-control-panel class="mt-6" v-if="powerDevicesCount > 0"></power-control-panel>
        </v-col>
    </v-row>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import ZOffsetPanel from "../components/panels/ZOffsetPanel";

    export default {
        components: {ZOffsetPanel},
        data: () => ({
            configExists: false
        }),
        computed: {
            ...mapState({
                showDashboardConsole: state => state.gui.dashboard.boolConsole,
                klippy_state: state => state.printer.webhooks.state,
                config: state => state.printer.configfile.config
            }),
            ...mapGetters([
                'showDashboardWebcam',
                'powerDevicesCount',
                'existPrinterConfig'
            ])
        },
        created() {
            //this.is_ready = (this.klippy_state === "ready") ? true : false;
        },
        watch: {
            config: {
                deep: true,
                handler() {
                    this.configExists = this.$store.getters.existPrinterConfig;
                }
            }
        }
    }
</script>