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
            <v-container class="px-0">
                <v-row align="center" class="text-center">
                    <v-col class="py-2">
                        <strong>Heater Temp</strong>
                    </v-col>
                    <v-col class="py-2">
                        <strong>Bed Temp</strong>
                    </v-col>
                </v-row>
            </v-container>
            <v-divider class="my-1"></v-divider>
            <v-container class="px-0">
                <v-row align="center" class="text-center">
                    <v-col class="py-2">
                    <strong>{{profile.heater}}°C</strong>
                    </v-col>
                    <v-col class="py-2">
                    <strong>{{profile.bed}}°C</strong>
                    </v-col>
                </v-row>
            </v-container>
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