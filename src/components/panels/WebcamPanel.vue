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
        <v-card-text class="px-0 py-0 content">
            <img :src="webcamUrl" class="webcamImage" />
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {

            }
        },
        computed: {
            ...mapState({
                webcamUrl: state => state.webcam.url,
            })
        },
        methods: {

        }
    }
</script>