<style>

</style>

<template>
    <v-card v-if="(printer_state === 'Printing' && printer_is_printing)">
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon class="mdi mdi-arrow-collapse-vertical" left></v-icon>Z Baby Stepping</span>
            </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="py-1">
            <v-row class="">
                <v-col class="col-12 pb-0 text-center">
                    <p>Current Offset: {{ base_zpos.toFixed(2) }}mm</p>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="col-12 pt-0 text-center">
                    <v-btn @click="sendBabySteppingDown()" class="mx-2" :loading="loadingBabySteppingDown" ><v-icon class="mr-2">mdi-arrow-collapse-down</v-icon> -0.05mm</v-btn>
                    <v-btn @click="sendBabySteppingUp()" class="mx-2" :loading="loadingBabySteppingUp" ><v-icon class="mr-2">mdi-arrow-expand-up</v-icon> +0.05mm</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'
    import Vue from "vue";

    export default {
        components: {

        },
        data: function() {
            return {
                loadingBabySteppingDown: false,
                loadingBabySteppingUp: false,
            }
        },
        computed: {
            ...mapState({
                loadings: state => state.loadings,
                base_zpos: state => state.printer.gcode.base_zpos,
                printer_state: state => state.printer.idle_timeout.state,
                printer_is_paused: state => state.printer.pause_resume.is_paused,
                printer_is_printing: state => state.printer.virtual_sdcard.is_active,
            }),
        },
        methods: {
            sendBabySteppingDown() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=-0.05 MOVE=1";
                this.$store.commit('setLoading', { name: 'babySteppingDown' });
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('post_printer_gcode_script', { script: gcode }, "respondeBabySteppingDown");
            },
            sendBabySteppingUp() {
                let gcode = "SET_GCODE_OFFSET Z_ADJUST=0.05 MOVE=1";
                this.$store.commit('setLoading', { name: 'babySteppingUp' });
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('post_printer_gcode_script', { script: gcode }, "respondeBabySteppingUp");
            },
        },
        watch: {
            loadings: function(loadings) {
                this.loadingBabySteppingDown = loadings.includes('babySteppingDown');
                this.loadingBabySteppingUp = loadings.includes('babySteppingUp');
            },
        }
    }
</script>