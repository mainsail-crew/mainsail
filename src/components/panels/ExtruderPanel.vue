<style>

</style>

<template>
    <v-card v-if="(['standby', 'paused', 'complete'].includes(printer_state))">
        <v-container>
            <v-row class="">
                <v-col class="col col-md-6">
                    <v-label>Feed amount in mm:</v-label>
                    <v-btn-toggle class="mt-2" dense no-gutters style="flex-wrap: nowrap; width: 100%;" >
                        <v-btn v-for="amount in feedamountsSorted" v-bind:key="amount" @click="setFeedAmount(amount)" dense :class="(amount === feedAmount ? 'v-btn--active' : '') + ' btnMinWidthAuto flex-grow-1 px-0 _btnFeedrate'">{{ amount }}</v-btn>
                    </v-btn-toggle>
                </v-col>
                <v-col class="col col-md-6">
                    <v-label>Feedrate in mm/s:</v-label>
                    <v-btn-toggle class="mt-2" dense no-gutters style="flex-wrap: nowrap; width: 100%;" >
                        <v-btn v-for="rate in feedratesSorted" v-bind:key="rate" @click="setFeedrate(rate)" dense :class="(feedrate === rate ? 'v-btn--active' : '') + ' btnMinWidthAuto flex-grow-1 px-0 _btnFeedrate'">{{ rate }}</v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>
            <v-row class="">
                <v-col class="col text-center">
                    <v-btn small @click="sendRetract()" class="mx-2" :loading="loadings.includes('btnRetract')" :disabled="!this['printer/getExtrudePossible']"><v-icon small class="mr-1">mdi-arrow-up-bold</v-icon> Retract</v-btn>
                    <v-btn small @click="sendDetract()" class="mx-2" :loading="loadings.includes('btnDetract')" :disabled="!this['printer/getExtrudePossible']"><v-icon small class="mr-1">mdi-arrow-down-bold</v-icon> Extrude</v-btn>
                </v-col>
            </v-row>
        </v-container>
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
                feedAmount: 25,
                feedrate: 5,
            }
        },
        computed: {
            ...mapState({
                loadings: state => state.socket.loadings,
                printer_state: state => state.printer.print_stats.state,
                extruder: state => state.printer.extruder,
                config: state => state.printer.configfile.config,

                feedamounts: state => state.gui.dashboard.extruder.feedamounts,
                feedrates: state => state.gui.dashboard.extruder.feedrates,
            }),
            ...mapGetters([
                'printer/getExtrudePossible',
            ]),
            feedamountsSorted: {
                get() {
                    return [...this.feedamounts].sort((a,b) => { return b-a })
                }
            },
            feedratesSorted: {
                get() {
                    return [...this.feedrates].sort((a,b) => { return b-a })
                }
            }
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
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'btnRetract' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'btnRetract' });
            },
            sendDetract() {
                let gcode = "M83\nG1 E"+this.feedAmount+" F"+(this.feedrate * 60);
                this.$store.commit('server/addEvent', { message: gcode, type: 'command' });
                this.$store.commit('socket/addLoading', { name: 'btnDetract' });
                Vue.prototype.$socket.sendObj('printer.gcode.script', { script: gcode }, "socket/removeLoading", { name: 'btnDetract' });
            },
        }
    }
</script>
