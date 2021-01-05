<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card v-if="profile.heater!=0">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-fire</v-icon>Preheat {{profile.material}}</span>
            </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn v-on:click="executePreheat(profile.heater,profile.bed)"  rounded color="blue-grey darken-4"><v-icon left>mdi-radiator</v-icon>Heat</v-btn>
        </v-toolbar>
        <v-card-text class="px-0 py-0 content">
            <v-row class="text-center pt-2" align="center">
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0"><strong>Heater Temp</strong></v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0"><strong>Bed Temp</strong></v-col></v-row>
                </v-col>
            </v-row>
            <v-divider class="my-2"></v-divider>
            <v-row class="text-center py-1 pb-2" v-if="profile.heater!=0" align="center">
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0">{{profile.heater}}°C</v-col></v-row>
                </v-col>
                <v-col class="equal-width py-0 px-0">
                    <v-row><v-col class="px-0 py-0">{{profile.bed}}°C</v-col></v-row>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import {bus} from "../../main";

    export default {
        props: ['profile'],
        components: {

        },
        computed: {
             
        },
        methods: {
            executePreheat:function(heater,bed){
                this.$socket.sendObj('printer.gcode.script', { script: 'SET_HEATER_TEMPERATURE HEATER=extruder TARGET='+heater });
                this.$socket.sendObj('printer.gcode.script', { script: 'SET_HEATER_TEMPERATURE HEATER=heater_bed TARGET='+bed });
            },
            show:function(e){
                bus.$emit("showkeyboard",e);
            },
            hide:function(){
                bus.$emit("hidekeyboard");
            }
        },
    }
</script>