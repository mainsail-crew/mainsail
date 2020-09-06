<style>

</style>

<template>
    <v-card v-if="(['standby', 'paused', 'complete'].includes(printer_state))">
        <v-row class="px-3">
            <v-col class="col-12 col-md-6">
                <v-label>Feed amount in mm:</v-label>
                <v-btn-toggle class="mt-2" no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="setFeedAmount(100)" cols="1" :class="(feedAmount === 100 ? 'v-btn--active' : '') + ' flex-grow-1'">100</v-btn>
                    <v-btn @click="setFeedAmount(50)" cols="1" :class="(feedAmount === 50 ? 'v-btn--active' : '') + ' flex-grow-1'">50</v-btn>
                    <v-btn @click="setFeedAmount(20)" cols="1" :class="(feedAmount === 20 ? 'v-btn--active' : '') + ' flex-grow-1'">20</v-btn>
                    <v-btn @click="setFeedAmount(10)" cols="1" :class="(feedAmount === 10 ? 'v-btn--active' : '') + ' flex-grow-1'">10</v-btn>
                    <v-btn @click="setFeedAmount(5)" cols="1" :class="(feedAmount === 5 ? 'v-btn--active' : '') + ' flex-grow-1'">5</v-btn>
                    <v-btn @click="setFeedAmount(1)" cols="1" :class="(feedAmount === 1 ? 'v-btn--active' : '') + ' flex-grow-1'">1</v-btn>
                </v-btn-toggle>
            </v-col>
            <v-col class="col-12 col-md-6">
                <v-label>Feedrate in mm/s:</v-label>
                <v-btn-toggle class="mt-2" no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn @click="setFeedrate(100)" cols="1" :class="(feedrate === 60 ? 'v-btn--active' : '') + ' flex-grow-1'">60</v-btn>
                    <v-btn @click="setFeedrate(50)" cols="1" :class="(feedrate === 30 ? 'v-btn--active' : '') + ' flex-grow-1'">30</v-btn>
                    <v-btn @click="setFeedrate(20)" cols="1" :class="(feedrate === 15 ? 'v-btn--active' : '') + ' flex-grow-1'">15</v-btn>
                    <v-btn @click="setFeedrate(10)" cols="1" :class="(feedrate === 5 ? 'v-btn--active' : '') + ' flex-grow-1'">5</v-btn>
                    <v-btn @click="setFeedrate(1)" cols="1" :class="(feedrate === 1 ? 'v-btn--active' : '') + ' flex-grow-1'">1</v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="px-3">
            <v-col class="col-12 text-center">
                <v-btn @click="sendRetract()" class="mx-2" :loading="loadingRetract" :disabled="!(config !== undefined && config.extruder !== null && (config.extruder.min_extrude_temp < extruder.temperature || !config.extruder.min_extrude_temp))"><v-icon>mdi-arrow-up-bold</v-icon> Retract</v-btn>
                <v-btn @click="sendDetract()" class="mx-2" :loading="loadingDetract" :disabled="!(config !== undefined && config.extruder !== null && (config.extruder.min_extrude_temp < extruder.temperature || !config.extruder.min_extrude_temp))"><v-icon>mdi-arrow-down-bold</v-icon> Extrude</v-btn>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import Vue from "vue";

    export default {
        components: {

        },
        data: function() {
            return {
                feedAmount: 20,
                feedrate: 5,
                loadingRetract: false,
                loadingDetract: false,
            }
        },
        computed: {
            ...mapState({
                loadings: state => state.loadings,
                printer_state: state => state.printer.print_stats.state,
                extruder: state => state.printer.extruder,
                config: state => state.printer.configfile.config
            }),
            ...mapGetters([
                'getMacros',
                'getCurrentExtruder',
            ]),
        },
        methods: {
            setFeedAmount(value) {
                this.feedAmount = value;
            },
            setFeedrate(value) {
                this.feedrate = value;
            },
            sendRetract() {
                let gcode = "M83\nG1 E-"+this.feedAmount+" F"+(this.feedrate * 60);
                this.$store.commit('setLoading', { name: 'extruderRetract' });
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "respondeExtruderRetract");
            },
            sendDetract() {
                let gcode = "M83\nG1 E"+this.feedAmount+" F"+(this.feedrate * 60);
                this.$store.commit('setLoading', { name: 'extruderDetract' });
                this.$store.commit('addGcodeResponse', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "respondeExtruderDetract");
            },
        },
        watch: {
            loadings: function(loadings) {
                this.loadingRetract = loadings.includes('extruderRetract');
                this.loadingDetract = loadings.includes('extruderDetract');
            },
        }
    }
</script>
