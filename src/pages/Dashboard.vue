<template>
    <v-row>
        <v-col class="col-sm-12 col-md-7">
            <status-panel></status-panel>
            <webcam-panel v-if="showDashboardWebcam" class="mt-6"></webcam-panel>
            <control-panel class="mt-6" v-if="is_ready"></control-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-5">
            <tools-panel v-if="is_ready"></tools-panel>
            <peripherie-panel class="mt-6" v-if="is_ready"></peripherie-panel>
            <miniconsole-panel class="mt-6" v-if="is_ready && showDashboardConsole"></miniconsole-panel>
        </v-col>
    </v-row>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'

    export default {
        data: () => ({
            is_ready: false
        }),
        computed: {
            ...mapState({
                showDashboardConsole: state => state.gui.dashboard.boolConsole,
                klippy_state: state => state.socket.klippy_state,
            }),
            ...mapGetters([
                'showDashboardWebcam'
            ])
        },
        created() {
            this.is_ready = (this.klippy_state === "ready") ? true : false;
        },
        watch: {
            klippy_state() {
                this.is_ready = (this.klippy_state === "ready") ? true : false;
            }
        }
    }
</script>