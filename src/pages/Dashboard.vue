<template>
    <v-row>
        <v-col class="col-sm-12 col-md-7">
            <status-panel></status-panel>
            <webcam-panel v-if="showDashboardWebcam" class="mt-6"></webcam-panel>
            <control-panel class="mt-6"></control-panel>
        </v-col>
        <v-col class="col-sm-12 col-md-5">
            <tools-panel></tools-panel>
            <tempchart-panel class="mt-6"></tempchart-panel>
            <peripherie-panel></peripherie-panel>
        </v-col>
    </v-row>
</template>

<script>
    import { mapGetters } from 'vuex'

    export default {
        computed: {
            ...mapGetters([
                'showDashboardWebcam'
            ])
        },
    }
</script>