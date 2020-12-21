
<template>
    <div>
        <v-card elevation="0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>Modules</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-1">
                                    <div @click="dialogCPU.show=true" v-if="ifintel" v-bind:style="{width: '175px',height:'175px',backgroundImage:'url('+require('@/assets/ressourcemonitor/cpu_intel.png')+')',backgroundSize:'175px 175px'}">
                                        <div class="px-10 py-12">
                                            <strong>{{this.$store.state.ressourcemonitor.cpu.brand}} </strong>
                                        </div>
                                    </div>
                                    <div @click="dialogCPU.show=true" v-if="ifamd" v-bind:style="{width: '175px',height:'175px',backgroundImage:'url('+require('@/assets/ressourcemonitor/cpu_amd.png')+')',backgroundSize:'175px 175px'}">
                                        <div class="px-10 py-12">
                                            <strong>{{this.$store.state.ressourcemonitor.cpu.brand}} </strong>
                                        </div>
                                    </div>
                                    <div @click="dialogCPU.show=true" v-if="ifsoc" v-bind:style="{width: '175px',height:'175px',backgroundImage:'url('+require('@/assets/ressourcemonitor/cpu_soc.png')+')',backgroundSize:'175px 175px'}">
                                        <div class="px-10 py-12">
                                            <strong>{{this.$store.state.ressourcemonitor.cpu.brand}} </strong>
                                        </div>
                                    </div>
                                    <div @click="dialogCPU.show=true" v-if="!ifamd&&!ifintel&&!ifsoc" v-bind:style="{width: '175px',height:'175px',backgroundImage:'url('+require('@/assets/ressourcemonitor/cpu_unknown.png')+')',backgroundSize:'175px 175px'}">
                                        <div class="px-10 py-12">
                                            <strong>{{this.$store.state.ressourcemonitor.cpu.brand}} </strong>
                                        </div>
                                    </div>
                                </v-col>
                            </v-row>
                            <v-row class="pb-3 px-0">
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
         <v-dialog v-model="dialogCPU.show" max-width="400">
                <v-card>
                    <v-card-title class="headline">CPU Details</v-card-title>
                    <v-card-text>
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row>
                                    <v-col class="py-0 px-3">
                                        <div>
                                            <strong>Manufacturer: </strong>{{this.$store.state.ressourcemonitor.cpu.vendor}}<br>
                                            <strong>Name: </strong>{{this.$store.state.ressourcemonitor.cpu.brand}}<br>
                                            <strong>Cores: </strong>{{this.$store.state.ressourcemonitor.cpu.cores}}<br>
                                            <strong>Threads: </strong>{{this.$store.state.ressourcemonitor.cpu.threads}}<br>
                                            <strong>Socket: </strong>{{this.$store.state.ressourcemonitor.cpu.socket}}<br>
                                            <strong>Min Frequency: </strong>{{this.$store.state.ressourcemonitor.cpu.freqmin}} Ghz<br>
                                            <strong>Max Frequency: </strong>{{this.$store.state.ressourcemonitor.cpu.freqmax}} Ghz<br>
                                        </div>
                                    </v-col>
                            </v-row>
                            <v-row class="pt-3 pl-3">
                                <v-col class="py-0 px-0 equal-width" v-for="core in this.$store.state.ressourcemonitor.cpu.threads" :key="core">
                                    <div class="py-8" v-bind:style="{width: '87px',height:'57px',backgroundImage:'url('+require('@/assets/ressourcemonitor/blank.png')+')',backgroundSize:'75px 57px'}">
                                        <div style="margin-top: -33px;margin-left: 7px;font-size: 10px">
                                            <strong>Core: {{core-1}} </strong>
                                        </div>
                                        <div style="margin-top: -9px;margin-left: 7px;font-size: 10px">
                                            <strong>{{getCoreLoad(core-1).load.toFixed(2)}} %</strong>
                                        </div>
                                        <div style="margin-top: -9px;margin-left: 7px;font-size: 10px">
                                            <strong>{{getCoreFreq(core-1).toFixed(2)}} GHz</strong>
                                        </div>
                                        <div style="margin-top: -9px;margin-left: 7px;font-size: 10px">
                                            <strong>{{getCoreTemp(core-1).toFixed(2)}} C°</strong>
                                        </div>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="" text @click="dialogCPU.show = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                dialogCPU: {
                    show: false,
                },
            }
        },
        computed: {
            ifsoc:function(){
                var socket=this.$store.state.ressourcemonitor.cpu.socket;
                console.log(socket)
                if(socket=="SOC"){
                    return true;
                }
                return false;
            },
            ifamd:function(){
                var socket=this.$store.state.ressourcemonitor.cpu.vendor;
                console.log(socket)
                if(socket=="AMD"){
                    return true;
                }
                return false;
            },
            ifintel:function(){
                var socket=this.$store.state.ressourcemonitor.cpu.vendor;
                console.log(socket)
                if(socket=="Intel"){
                    return true;
                }
                return false;
            },
        },
        methods: {
            getCoreLoad:function(core){
                if(this.$store.state.ressourcemonitor.cpu.loads==0){
                    return -1;
                }
                var loadraw=this.$store.state.ressourcemonitor.cpu.loads[core];
                return loadraw;
            },
            getCoreFreq:function(core){
                if(this.$store.state.ressourcemonitor.cpu.freqcores==0){
                    return -1;
                }
                var freqraw=this.$store.state.ressourcemonitor.cpu.freqcores[core];
                return freqraw;
            },
            getCoreTemp:function(core){
                if(this.$store.state.ressourcemonitor.cpu.temps.length==0){
                    return -1;
                }
                var tempraw=this.$store.state.ressourcemonitor.cpu.temps[core];
                return tempraw;
            },
            openRamDetails:function(module){
                this.dialogRAM.module=module
                if(module.type=="Empty"){
                    this.dialogRAM.emptySlot = true
                }else{
                    this.dialogRAM.emptySlot = false
                }
                this.dialogRAM.show = true
            }

        },
        mounted(){

        }
    }
</script>