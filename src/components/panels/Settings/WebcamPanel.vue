<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-webcam</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Webcam</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pb-0 pt-3 content">
            <v-row>
                <v-col class="px-10 py-0">
                    <v-text-field
                        v-model="webcamUrl"
                        label="Webcam URL"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="px-10 py-0">
                    <v-switch v-model="boolNavi" label="Show in Navigation"></v-switch>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            webcamUrl: {
                get() {
                    return this.$store.state.webcam.url;
                },
                set(newWebcamUrl) {
                    return this.$store.dispatch('setSettings', { webcam: { url: newWebcamUrl } });
                }
            },
            boolNavi: {
                get() {
                    return this.$store.state.gui.webcam.bool;
                },
                set(bool) {
                    return this.$store.dispatch('setSettings', { gui: { webcam: { bool: bool } } });
                }
            },
        },
        methods: {

        }
    }
</script>