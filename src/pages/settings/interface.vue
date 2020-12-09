<template>
    <div>
        <v-row>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-general-panel></settings-general-panel>
                <settings-webcam-panel class="mt-6"></settings-webcam-panel>
            </v-col>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-dashboard-panel></settings-dashboard-panel>
                <settings-preheat-panel></settings-preheat-panel>
                <settings-scale-panel v-if="showDashboardScale" class="mt-6"></settings-scale-panel>
            </v-col>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-macros-panel></settings-macros-panel>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        computed: {
            ...mapState({
                showDashboardScale: state => state.gui.dashboard.boolScale,
            }),
        },
        methods: {
            ...mapActions([

            ]),
        }
    }
</script>