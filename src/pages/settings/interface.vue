<template>
    <div>
        <v-row>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-general-panel></settings-general-panel>
                <settings-webcam-panel class="mt-6"></settings-webcam-panel>
                <settings-dashboard-panel class="mt-6"></settings-dashboard-panel>
                <settings-console-panel class="mt-6"></settings-console-panel>
            </v-col>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-control-panel></settings-control-panel>
                <settings-macros-panel class="mt-6"></settings-macros-panel>
            </v-col>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-presets-panel></settings-presets-panel>
                <settings-remote-printers-panel class="mt-6"></settings-remote-printers-panel>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        computed: {
            ...mapState({

            }),
        },
        methods: {
            ...mapActions([

            ]),
        }
    }
</script>