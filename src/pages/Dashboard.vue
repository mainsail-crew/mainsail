<template>
    <v-row>
        <v-col class="col-sm-12 col-md-7">
            <status-panel v-if="is_ready"></status-panel>
            <klippy-state-panel v-if="!is_ready"></klippy-state-panel>
            <webcam-panel v-if="showDashboardWebcam" class="mt-6"></webcam-panel>
            <z-offset-panel class="mt-6" v-if="is_ready"></z-offset-panel>
            <control-panel class="mt-6" v-if="is_ready"></control-panel>
            <extruder-panel class="mt-6" v-if="is_ready"></extruder-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-5">
            <tools-panel></tools-panel>
            <peripherie-panel class="mt-6" v-if="is_ready"></peripherie-panel>
            <miniconsole-panel class="mt-6" v-if="is_ready && showDashboardConsole"></miniconsole-panel>
        </v-col>
    </v-row>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import ZOffsetPanel from "../components/panels/ZOffsetPanel";

    export default {
        components: {ZOffsetPanel},
        data: () => ({
            //is_ready: false
        }),
        computed: {
            ...mapState({
                showDashboardConsole: state => state.gui.dashboard.boolConsole,
                klippy_state: state => state.socket.klippy_state,
                is_ready: state => state.socket.is_ready,
            }),
            ...mapGetters([
                'showDashboardWebcam'
            ])
        },
        /*created() {
            //this.is_ready = (this.klippy_state === "ready") ? true : false;
        },
        watch: {
            klippy_state() {
                this.is_ready = (this.klippy_state === "ready") ? true : false;
            }
        }*/
    }
</script>