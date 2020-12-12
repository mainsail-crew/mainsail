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
            <v-row class="text-center pt-2" align="center">
                <v-col class="py-0 flex-grow-0 pl-8 pr-10">
                    
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0"><strong>Weight</strong></v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0"><strong>Position</strong></v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 pr-sm-6">
                    <v-row><v-col class="px-0 py-0"><strong>Offset</strong></v-col></v-row>
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider>
            <v-row class="text-center pt-1" align="center">
                <v-col class="py-0 flex-grow-0 pl-8 pr-3">
                    <v-icon>mdi-numeric-1-circle</v-icon>
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0">{{getWeight1}}g</v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0">{{getPosition1}}</v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 pr-sm-6">
                    <v-text-field class="py-0 scalepanel-dashboard"
                                v-model="scaleOffset1"
                                hide-details
                                label="Offset 1"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric" 
                            ></v-text-field>
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider>
            <v-row class="text-center py-1 pb-2" align="center">
                <v-col class="py-0 flex-grow-0 pl-8 pr-3">
                    <v-icon>mdi-numeric-2-circle</v-icon>
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0">{{getWeight2}}g</v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0">{{getPosition2}}</v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 pr-sm-6">
                    <v-text-field class="py-0 scalepanel-dashboard"
                                v-model="scaleOffset2"
                                hide-details
                                label="Offset 2"
                                @click.native="show"
                                @blur="hide"
                                data-layout="numeric" 
                            ></v-text-field>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import {bus} from "../../main";
    import { mapState } from 'vuex'

    export default {
        components: {

        },
        computed: {
            ...mapState({
                'scaleConfig': state => state.gui.scale
            }),
            getWeight1(){
                console.log(this.scaleConfig.raw1)
                var calculatedWeight1 = this.scaleConfig.raw1 -this.scaleConfig.tare1 - this.scaleConfig.offset1;
                if(calculatedWeight1 < 0){
                    return 0;
                }
                return this.scaleConfig.raw1 -this.scaleConfig.tare1 - this.scaleConfig.offset1;
            },
            getPosition1(){
                var position1 = this.scaleConfig.position1;
                if(position1==''){
                    return "Unknown";
                }
                return this.scaleConfig.position1;
            },
            scaleOffset1: {
                get() {
                    return this.$store.state.gui.scale.offset1;
                },
                set(offset1) {
                    return this.$store.dispatch('gui/setSettings', { scale: { offset1 } });
                }
            },
            getWeight2(){
                var calculatedWeight2 = this.scaleConfig.raw2 -this.scaleConfig.tare2 - this.scaleConfig.offset2;
                if(calculatedWeight2 < 0){
                    return 0;
                }
                return this.scaleConfig.raw2 -this.scaleConfig.tare2 - this.scaleConfig.offset2;
            },
            getPosition2(){
                var position2 = this.scaleConfig.position2;
                if(position2==''){
                    return "Unknown";
                }
                return this.scaleConfig.position2;
            },
            scaleOffset2: {
                get() {
                    return this.$store.state.gui.scale.offset2;
                },
                set(offset2) {
                    return this.$store.dispatch('gui/setSettings', { scale: { offset2 } });
                }
            }
        },
        methods: {
            show:function(e){
                bus.$emit("showkeyboard",e);
            },
            hide:function(){
                bus.$emit("hidekeyboard");
            }
        },
    }
</script>