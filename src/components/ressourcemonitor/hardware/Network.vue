
<template>
    <div>
        <v-card class="mb-5" v-if="this.$store.state.ressourcemonitor.network.interfaces==0">
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
                                    HSInfoServer couldnt find any Network Interfaces!
                                </v-col>
                            </v-row>
                            <v-row class="pb-3 px-0">
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        <v-card class="mb-5" v-for="(card, index) in this.$store.state.ressourcemonitor.network.interfaces" :key="index">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>Network {{index}}</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-1">
                                    <div v-if="!card.virtual&&card.iface.includes('lo')||card.iface.includes('Loopback')" @click="openNetworkDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/network_loopback.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                    <div v-if="!card.virtual&&card.type=='wired'" @click="openNetworkDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/network_lan.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                    <div v-if="!card.virtual&&card.type=='wireless'" @click="openNetworkDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/network_wifi.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                    <div v-if="card.virtual&&!card.iface.includes('lo')&&!card.iface.includes('Loopback')" @click="openNetworkDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/network_virtual.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                </v-col>
                                <v-col class="py-0 px-1">
                                    {{card.iface}}
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        
       
        <v-dialog v-model="dialogInterface.show" max-width="400">
            <v-card>
                <v-card-title class="headline">Interface {{this.dialogInterface.index}} Details</v-card-title>
                <v-card-text>
                <v-row>
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                                <v-col class="py-0 px-3">
                                    <div>
                                        <strong>Interface: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].iface}}<br>
                                        <strong>Name: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].ifaceName}}<br>
                                        <strong>Mac: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].mac}}<br>
                                        <strong>Speed: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].speed}} MBit<br>
                                        <br>
                                        <strong>IPv4 Configuration</strong><br>
                                        <strong>Address: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].ip4}}<br>
                                        <strong>Subnet: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].ip4subnet}}<br>
                                        <br>
                                        <strong>IPv6 Configuration</strong><br>
                                        <strong>Address: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].ip6}}<br>
                                        <strong>Subnet: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].ip6subnet}}<br>
                                        <br>
                                        <strong>DNS Suffix: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].dnsSuffix}}<br>
                                        <strong>DHCP: </strong>{{this.$store.state.ressourcemonitor.network.interfaces[this.dialogInterface.index].dhcp}}<br>
                                    </div>
                                </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogInterface.show = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

    export default {
        components: {
        },
        data: function() {
            return {
                dialogInterface: {
                    show: false,
                    index:0
                },
            }
        },
        computed: {

        },
        methods: {
            openNetworkDetails:function(index){
                this.dialogInterface.index=index
                this.dialogInterface.show = true
            }

        },
        mounted(){
        }
    }
</script>