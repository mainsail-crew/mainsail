
<template>
    <div>
        <v-card elevation="0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-chart-donut</v-icon>Usage</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3">
                            <v-row>
                                
                                <v-col class="py-0 px-3 pt-3">
                                    <line-chart :chart-data="chartdata" :max="(this.$store.state.ressourcemonitor.ram.total/1024/1024/1024).toFixed(0)+1"></line-chart>
                                </v-col>
                                
                            </v-row>
                            <v-row>
                                <v-col class="py-10">
                                    <v-col class="py-0 px-3 equal-width">
                                        <v-row>
                                            <v-col class="py-0 pl-5">
                                                
                                            </v-col>
                                            <v-col class="py-0 pl-5">
                                                <img :src="require('@/assets/ressourcemonitor/ram.png')" width="" height="" style="margin-left:-5px">
                                                <div style="margin-top:-57px" class="pl-2">
                                                    <strong>Total: </strong> {{(this.$store.state.ressourcemonitor.ram.total/1024/1024/1024).toFixed(2)}} GB <br>
                                                    <strong>Used: </strong> {{(this.$store.state.ressourcemonitor.ram.used/1024/1024/1024).toFixed(2)}} GB<br>
                                                </div>
                                            </v-col>
                                            <v-col class="py-0 pl-5">
                                                
                                            </v-col>
                                            <v-col class="py-0 pl-5">
                                                <img :src="require('@/assets/ressourcemonitor/swap.png')" width="" height="" style="margin-left:-5px">
                                                <div style="margin-top:-57px" class="pl-2">
                                                    <strong>Total: </strong> {{(this.$store.state.ressourcemonitor.ram.totalswap/1024/1024/1024).toFixed(2)}} GB <br>
                                                    <strong>Used: </strong> {{(this.$store.state.ressourcemonitor.ram.usedswap/1024/1024/1024).toFixed(2)}} GB<br>
                                                </div>
                                            </v-col>
                                            <v-col class="py-0 pl-5">
                                                
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-col>
                                
                            </v-row>
                        </v-col> 
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
         <v-dialog v-model="dialogRAM.show" max-width="535">
                <v-card>
                    <v-card-title class="headline">RAM Details</v-card-title>
                    <v-card-text>
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row>
                                    <v-col class="py-0 px-3">
                                                <div v-if="dialogRAM.emptySlot">
                                                    <strong>Slot: </strong>{{this.dialogRAM.module.bank}} <br>
                                                    <br>
                                                    <strong>This Slot is unpopulated or has a Faulty RAM Module!</strong><br>
                                                </div>
                                                <div v-if="dialogRAM.emptySlot==false">
                                                    <strong>Slot: </strong>{{this.dialogRAM.module.bank}} <br>
                                                    <strong>Size: </strong>{{(this.dialogRAM.module.size/1024/1024).toFixed(2)}} MB <br>
                                                    <strong>Clock: </strong>{{this.dialogRAM.module.clockSpeed}} MHz<br>
                                                    <strong>Type: </strong>{{this.dialogRAM.module.type}} <br>
                                                    <strong>PartNum: </strong>{{this.dialogRAM.module.partNum}} <br>
                                                    <strong>Serial: </strong>{{this.dialogRAM.module.serialNum}} <br>
                                                    <strong>Manufacturer: </strong>{{this.dialogRAM.module.manufacturer}} <br>
                                                    <strong>Voltage Configured: </strong>{{this.dialogRAM.module.voltageConfigured}} V<br>
                                                    <strong>Voltage Min: </strong>{{this.dialogRAM.module.voltageMin}} V<br>
                                                    <strong>Voltage Max: </strong>{{this.dialogRAM.module.voltageMax}} V<br>
                                                </div>
                                    </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="" text @click="dialogRAM.show = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import LineChart from '@/charts/LineChartUsage.js'
    export default {
        components: {
            LineChart
        },
        data: function() {
            return {
                dialogRAM: {
                    show: false,
                    emptySlot: false,
                    module: []
                },
                chartdata: {
                    datasets: []
                },
                chartoptions: {
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    max: 15
                                }
                            }
                        ]
                    }
                },
            }
        },
        computed: {
            ...mapState ({
                datasets: state => state.ressourcemonitor.ramHistory.datasets,
            }),
            datasets: {
                get () {
                    return this.$store.state.ressourcemonitor.ramHistory.datasets
                }
            },
            ifsoc:function(){
                var socket=this.$store.state.ressourcemonitor.cpu.socket;
                console.log(socket)
                if(socket=="SOC"||socket==""||socket=="Unknown"){
                    return true;
                }
                return false;
            }
        },
        methods: {
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
            this.chartdata = {
                datasets: this.datasets
            }

        }
    }
</script>