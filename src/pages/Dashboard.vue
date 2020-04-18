<template>
    <v-row>
        <v-col class="col-sm-12 col-md-7">
            <status-panel></status-panel>
            <webcam-panel v-if="showDashboardWebcam" class="mt-6"></webcam-panel>
            <control-panel class="mt-6"></control-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-5">
            <tools-panel></tools-panel>
            <peripherie-panel class="mt-6"></peripherie-panel>
            <miniconsole-panel class="mt-6" v-if="showDashboardConsole"></miniconsole-panel>
        </v-col>
    </v-row>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'

    export default {
        computed: {
            ...mapState({
                showDashboardConsole: state => state.gui.dashboard.boolConsole,
            }),
            ...mapGetters([
                'showDashboardWebcam'
            ])
        },
    }
</script>