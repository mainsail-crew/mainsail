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
            <v-layout wrap class=" text-center">
                <v-flex col class="text-center">
                    <strong>Heater Temp</strong>
                </v-flex>
                <v-flex col class="text-center">
                    <strong>Bed Temp</strong>
                </v-flex>
            </v-layout>
        </v-card-text>
        <v-divider class="my-1"></v-divider>
        <v-card-text class="px-0 py-0 content">
            <v-layout wrap class=" text-center">
                <v-flex col class="text-center">
                    <strong>{{profile.heater}}°C</strong>
                </v-flex>
                <v-flex col class="text-center">
                    <strong>{{profile.bed}}°C</strong>
                </v-flex>
            </v-layout>
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