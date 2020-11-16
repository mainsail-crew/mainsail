<style>

</style>

<template>
    <v-card v-if="(['standby', 'paused', 'complete'].includes(printer_state))">
        <v-row class="px-3">
            <v-col class="col-12 col-md-6">
                <v-label>Feed amount in mm:</v-label>
                <v-btn-toggle class="mt-2" no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn v-for="amount in feedAmounts" v-bind:key="amount" @click="setFeedAmount(amount)" dense cols="1" :class="(amount === feedAmount ? 'v-btn--active' : '') + ' flex-grow-1 px-0 _btnFeedrate'">{{ amount }}</v-btn>
                </v-btn-toggle>
            </v-col>
            <v-col class="col-12 col-md-6">
                <v-label>Feedrate in mm/s:</v-label>
                <v-btn-toggle class="mt-2" no-gutters style="flex-wrap: nowrap; width: 100%;" >
                    <v-btn v-for="rate in feedrates" v-bind:key="rate" @click="setFeedrate(rate)" dense cols="1" :class="(feedrate === rate ? 'v-btn--active' : '') + ' flex-grow-1 px-0 _btnFeedrate'">{{ rate }}</v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row class="px-3">
            <v-col class="col-12 text-center">
                <v-btn @click="sendRetract()" class="mx-2" :loading="loadingRetract" :disabled="!this['printer/getExtrudePossible']"><v-icon>mdi-arrow-up-bold</v-icon> Retract</v-btn>
                <v-btn @click="sendDetract()" class="mx-2" :loading="loadingDetract" :disabled="!this['printer/getExtrudePossible']"><v-icon>mdi-arrow-down-bold</v-icon> Extrude</v-btn>
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
                feedAmounts: [ 100, 50, 20, 10, 5, 1 ],
                feedrates: [ 60, 30, 15, 5, 1 ],
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
                'printer/getExtrudePossible',
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
                this.$store.commit('server/addEvent', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode });
            },
            sendDetract() {
                let gcode = "M83\nG1 E"+this.feedAmount+" F"+(this.feedrate * 60);
                this.$store.commit('server/addEvent', gcode);
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode });
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
