<template>
    <div>
        <v-row>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-general-panel></settings-general-panel>
                <settings-webcam-panel class="mt-6"></settings-webcam-panel>
            </v-col>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-dashboard-panel></settings-dashboard-panel>
            </v-col>
            <v-col class="col-12 col-md-6 col-lg-4">
                <settings-macros-panel></settings-macros-panel>
            </v-col>
        </v-row>
        <v-fab-transition>
            <v-btn fab fixed large bottom right :loading="loadingUpload" @click="saveGuiSettings">
                <v-icon>mdi-check</v-icon>
            </v-btn>
        </v-fab-transition>
    </div>
</template>
<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        computed: {
            ...mapState({
                loadingUpload: state => state.socket.loadingSaveGuiConfig,
            }),
        },
        methods: {
            ...mapActions([
                'saveGuiSettings'
            ]),
        }
    }
</script>