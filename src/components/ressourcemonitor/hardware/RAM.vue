
<template>
    <div>
        <v-card>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>Modules</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                                <v-row class="pb-3 pl-10" v-if="!ifsoc">
                                    <v-col class="py-0 px-0" v-for="modules in this.$store.state.ressourcemonitor.ram.modules" :key="modules.bank" style="writing-mode:vertical-lr;margin-left: -4px;">
                                        <strong>{{modules.bank}} </strong>
                                    </v-col>
                                </v-row>
                                <v-row class="pb-3 pl-10">
                                    <v-col class="py-0 px-0 equal-width" v-for="modules in this.$store.state.ressourcemonitor.ram.modules" :key="modules.bank">
                                        <div>
                                            <img @click="openRamDetails(modules)" v-if="modules.type!='Empty'&&!ifsoc" :src="require('@/assets/ressourcemonitor/ram_populated.png')" width="15px" height="450px">
                                            <img @click="openRamDetails(modules)" v-if="modules.type=='Empty'&&!ifsoc" :src="require('@/assets/ressourcemonitor/ram_empty.png')" width="15px" height="450px">
                                            <img @click="openRamDetails(modules)" v-if="modules.type!='Empty'&&ifsoc" :src="require('@/assets/ressourcemonitor/ram_populated_soc.png')" width="" height="" style="margin-left:-5px">
                                            <img @click="openRamDetails(modules)" v-if="modules.type=='Empty'&&ifsoc" :src="require('@/assets/ressourcemonitor/ram_empty_soc.png')" width="" height="" style="margin-left:-5px">
                                            <div class="pb-4" v-if="ifsoc&&modules.bank!=''" style="margin-top: -30px; margin-left: 7px;">
                                                <strong>{{modules.bank}} </strong>
                                            </div>
                                        </div>
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
    export default {
        data: function() {
            return {
                dialogRAM: {
                    show: false,
                    emptySlot: false,
                    module: []
                },
            }
        },
        computed: {
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

        }
    }
</script>