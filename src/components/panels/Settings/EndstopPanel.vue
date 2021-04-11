<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-arrow-expand-vertical</v-icon>{{ $t('Settings.EndstopPanel.Endstops')}}</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pb-0">
            <v-container px-0 py-0>
                <div class="py-2" v-if="Object.keys(endstops).length">
                    <v-row v-for="(status, index) of sortEndstops" v-bind:key="index">
                        <v-col class="py-1">
                            <label class="mt-1 d-inline-block">{{ $t('Settings.EndstopPanel.Endstop')}} <b>{{ index.toUpperCase() }}</b></label>
                            <v-chip class="float-right" small :color="status === 'open' ? 'green' : 'red' " text-color="white">
                                <template v-if="status === 'open'">
                                    {{ $t('Settings.EndstopPanel.open')}}
                                </template>
                                <template v-else>
                                    {{ $t('Settings.EndstopPanel.TRIGGERED')}}
                                </template>
                            </v-chip>
                        </v-col>
                    </v-row>
                    <v-row v-if="probe !== false">
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
                </div>
                <v-row v-if="(Object.keys(endstops).length === 0 && endstops.constructor === Object)" >
                    <v-col>
                        <p>{{ $t('Settings.EndstopPanel.EndstopInfo')}}</p>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon @click="syncEndstops" :loading="loadings.includes('queryEndstops')">
                <v-icon>mdi-sync</v-icon>
            </v-btn>
    </v-card-actions>
    </v-card>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        components: {

        },
        data: function() {
            return {
                sortEndstops: {},
            }
        },
        computed: {
            ...mapState({
                loadings: state => state.socket.loadings,
                endstops: state => state.printer.endstops,
            }),
            probe: {
                get() {
                    if (
                        'probe' in this.$store.state.printer &&
                        'last_query' in this.$store.state.printer.probe
                    ) return this.$store.state.printer.probe.last_query

                    return false
                }
            }
        },
        created() {
            this.getEndstops();
        },
        methods: {
            syncEndstops() {
                this.$store.commit('socket/addLoading', { name: 'queryEndstops' })
                this.$socket.sendObj('printer.query_endstops.status', { }, "printer/getEndstopStatus")
                if (this.probe !== false) {
                    this.$store.commit('server/addEvent', { message: "QUERY_PROBE", type: 'command' })
                    this.$socket.sendObj('printer.gcode.script', { script: "QUERY_PROBE" })
                }
            },
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
    }
</script>