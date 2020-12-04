<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-scale</v-icon>Scale</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content">
            <v-row class="text-center" align="center">
                <v-col class="equal-width py-0 pr-sm-6">
                            <v-col class="px-0 py-3"><strong>Weight: {{getWeight}} G</strong></v-col>
                            <v-col class="px-0 py-3">Position: {{getPosition}}</v-col>
                </v-col>
            </v-row>
            <h1></h1>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        components: {

        },
        computed: {
            ...mapState({
                'scaleConfig': state => state.gui.scale
            }),
            getWeight(){
                var calculatedWeight = this.scaleConfig.raw -this.scaleConfig.tare - this.scaleConfig.offset;
                if(calculatedWeight < 0){
                    return 0;
                }
                return this.scaleConfig.raw -this.scaleConfig.tare - this.scaleConfig.offset;
            },
            getPosition(){
                return this.scaleConfig.position;
            }
        },
    }
</script>