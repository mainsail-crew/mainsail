<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-arrow-expand-vertical</v-icon>{{ $t('Settings.EndstopPanel.Endstops')}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pb-0">
            <v-container px-0 py-0>
                <template v-if="Object.keys(endstops).length">
                    <v-row v-for="key of Object.keys(endstops)" v-bind:key="key">
                        <v-col class="py-1">
                            <label class="mt-1 d-inline-block">{{ $t('Settings.EndstopPanel.Endstop')}} <b>{{ key.toUpperCase() }}</b></label>
                            <v-chip class="float-right" small :color="endstops[key] === 'open' ? 'green' : 'red' " text-color="white">
                                <template v-if="endstops[key] === 'open'">
                                    {{ $t('Settings.EndstopPanel.open')}}
                                </template>
                                <template v-else>
                                    {{ $t('Settings.EndstopPanel.TRIGGERED')}}
                                </template>
                            </v-chip>
                        </v-col>
                    </v-row>
                    <v-row v-if="existProbe">
                        <v-col class="py-1">
                            <label class="mt-1 d-inline-block">Probe</label>
                            <v-chip class="float-right" small :color="probe ? 'red' : 'green' " text-color="white">
                            <template v-if="probe">
                                {{ $t('Settings.EndstopPanel.TRIGGERED')}}
                            </template>
                            <template v-else>
                                {{ $t('Settings.EndstopPanel.open')}}
                            </template>
                            </v-chip>
                        </v-col>
                    </v-row>
                </template>
                <template v-else>
                    <v-row>
                        <v-col>
                            <p>{{ $t('Settings.EndstopPanel.EndstopInfo')}}</p>
                        </v-col>
                    </v-row>
                </template>
            </v-container>
        </v-card-text>
        <v-card-actions class="pt-3">
            <v-spacer></v-spacer>
            <v-btn icon @click="syncEndstops" :loading="loadings.includes('queryEndstops')">
                <v-icon>mdi-sync</v-icon>
            </v-btn>
    </v-card-actions>
    </v-card>
</template>

<script lang="ts">

import {Component, Mixins} from "vue-property-decorator";
import BaseMixin from "../../mixins/base";

@Component
export default class EndstopPanel extends Mixins(BaseMixin) {
    public sortEndstops: any = {}

    get endstops() {
        return this.$store.state.printer.endstops ?? {}
    }

    get existProbe () {
        return ('probe' in this.$store.state.printer.configfile.settings)
    }

    get probe () {
        if (
            'probe' in this.$store.state.printer &&
            'last_query' in this.$store.state.printer.probe
        ) return this.$store.state.printer.probe.last_query

        return false
    }

    syncEndstops() {
        this.$store.commit('socket/addLoading', { name: 'queryEndstops' })
        this.$socket.emit('printer.query_endstops.status', { }, "printer/getEndstopStatus")
        if (this.existProbe) {
            window.console.log("exist probe")
            this.$store.commit('server/addEvent', { message: "QUERY_PROBE", type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: "QUERY_PROBE" })
        }
    }
}

/*    import { mapState } from 'vuex'

    export default {
        created() {
            this.getEndstops();
        },
        methods: {
            ,
            getEndstops() {
                this.sortEndstops = {};

                let keys = Object.keys(this.endstops);
                keys.sort();

                for (let i = 0; i < keys.length; i++) {
                    let k = keys[i];
                    this.sortEndstops[k] = this.endstops[k];
                }
            }
        },
        watch: {
            endstops: function() {
                this.getEndstops();
            }
        }
    }*/
</script>