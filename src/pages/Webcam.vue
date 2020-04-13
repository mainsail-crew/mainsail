<style>

</style>

<template>
    <div>
        <v-row>
            <v-col col-12>
                <webcam-panel></webcam-panel>
            </v-col>
        </v-row>
    </div>
</template>
<script>
    import { mapState } from 'vuex';

    export default {
        data () {
            return {

            }
        },
        computed: {
            ...mapState({
                webcamUrl: state => state.webcam.url,
            }),
        },
        methods: {

        }
    }
</script>