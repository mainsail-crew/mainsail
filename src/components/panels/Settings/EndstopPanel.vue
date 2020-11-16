<template>
    <v-card>
        <v-list-item>
            <v-list-item-avatar color="grey"><v-icon dark>mdi-arrow-expand-vertical</v-icon></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Endstops</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-card-text class="px-0 pt-0 pb-2 content">
            <div v-for="(status, index) of sortEndstops" v-bind:key="index">
                <v-row class="px-6" >
                    <v-col sm-12>
                        <label class="mt-1 d-inline-block">Endstop <b>{{ index.toUpperCase() }}</b></label>
                        <v-chip class="float-right" :color="status === 'open' ? 'green' : 'red' " text-color="white">{{ status }}</v-chip>
                    </v-col>
                </v-row>
            </div>
            <v-row class="px-6" v-if="(Object.keys(endstops).length === 0 && endstops.constructor === Object)" >
                <v-col sm-12>
                    <p>Press the sync-button on the right-bottom to load the current endstop status.</p>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn icon @click="syncEndstops" :loading="loading">
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
                loading: false
            }
        },
        computed: {
            ...mapState({
                //loading: state => state.socket.loadingEndstopStatus,
                endstops: state => state.printer.endstops,
            })
        },
        created() {
            this.getEndstops();
        },
        methods: {
            syncEndstops() {
                // TODO loading
                //this.$store.commit('setLoadingEndstopStatus', true);
                this.$socket.sendObj('printer.query_endstops.status', { }, "printer/getEndstopStatus");
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