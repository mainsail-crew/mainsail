
<template>
    <div>
        <v-card class="mb-5" v-if="this.$store.state.ressourcemonitor.network.interfaces.length==0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>Network</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-1">
                                    HSInfoServer couldnt find any Network Interfaces
                                </v-col>
                            </v-row>
                            <v-row class="pb-3 px-0">
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>

        <v-card height=250 class="mb-5" v-if="this.$store.state.ressourcemonitor.network.interfaces.length!=0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-arrow-up-thick</v-icon>Transmit</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width pt-2">
                    <v-row>
                        <v-col class="py-0 px-3">
                            <div class="pl-2">MB</div>
                            <keep-alive>
                                <NetworkTransmit></NetworkTransmit>
                            </keep-alive>
                        </v-col> 
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>

        <v-card height=250 class="mb-5" v-if="this.$store.state.ressourcemonitor.network.interfaces.length!=0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-arrow-down-thick</v-icon>Receive</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width pt-2">
                    <v-row>
                        <v-col class="py-0 px-3">
                            <div class="pl-2">MB</div>
                            <keep-alive>
                                <NetworkReceive></NetworkReceive>
                            </keep-alive>
                        </v-col> 
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>

        <v-card class="mb-5" v-if="this.$store.state.ressourcemonitor.network.interfaces.length!=0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-tag-text</v-icon>Legend</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-0" v-for="card in this.$store.state.ressourcemonitor.network.interfaces.length" :key="card">
                            <div style="display:flex;font-size: 10px;" class="py-1 px-1"><div :style="{backgroundColor: getLabelColor(card-1),width: '15px',height: '15px',marginRight: '5px',marginTop: '3px'}"/>Network <div style="margin-left: 2px;;">{{card-1}}</div></div>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import NetworkTransmit from '@/charts/NetworkTransmit'
    import NetworkReceive from '@/charts/NetworkReceive'

    export default {
        components: {
            NetworkTransmit,
            NetworkReceive
        },
        data: function() {
            return{

            }
        },
        computed: {

        },
        methods: {
            getLabelColor:function(card){
                var color=this.$store.state.ressourcemonitor.network.colors[card];
                return color;
            }
        },
        mounted(){
        }
    }
</script>