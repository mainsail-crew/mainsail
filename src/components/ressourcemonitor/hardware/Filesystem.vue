
<template>
    <div>
        <v-card class="mb-5" v-for="(disk, index) in this.filterDisk" :key="index">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>Disk {{index}}</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-1">
                                    <div v-if="disk.interfaceType=='USB'" @click="openDiskDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/disk_usb.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                    <div v-if="disk.interfaceType=='NVMe'" @click="openDiskDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/disk_nvme.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                    <div v-if="disk.interfaceType=='SATA'&&disk.type=='SSD'" @click="openDiskDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/disk_ssd.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                    <div v-if="disk.interfaceType=='SATA'&&disk.type=='HD'" @click="openDiskDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/disk_hdd.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                    <div v-if="disk.interfaceType==''&&disk.type=='SSD'" @click="openDiskDetails(index)" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+require('@/assets/ressourcemonitor/disk_card.png')+')',backgroundSize:'80px 80px'}">
                                    </div>
                                </v-col>
                                <v-col class="py-0 px-1">
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        
       
        <v-dialog v-model="dialogDisk.show" max-width="400">
            <v-card>
                <v-card-title class="headline">Disk {{this.dialogDisk.index}} Details</v-card-title>
                <v-card-text>
                <v-row>
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                                <v-col class="py-0 px-3">
                                    <div>
                                        <strong>Device: </strong>{{this.filterDisk[this.dialogDisk.index].device}}<br>
                                        <strong>Type: </strong>{{this.filterDisk[this.dialogDisk.index].type}}<br>
                                        <strong>Name: </strong>{{this.filterDisk[this.dialogDisk.index].name}}<br>
                                        <strong>Vendor: </strong>{{this.filterDisk[this.dialogDisk.index].vendor}}<br>
                                        <strong>Size: </strong>{{(this.filterDisk[this.dialogDisk.index].size/1024/1024/1024).toFixed(2)}}GB<br>
                                        <strong>Firmware Revision: </strong>{{this.filterDisk[this.dialogDisk.index].firmwareRevision}}<br>
                                    </div>
                                    <div v-if="this.filterDisk[this.dialogDisk.index].interfaceType=='SATA'&&this.filterDisk[this.dialogDisk.index].type=='HD'">
                                        <strong>Bytes per Sector: </strong>{{this.filterDisk[this.dialogDisk.index].bytesPerSector}}<br>
                                        <strong>Cylinders: </strong>{{this.filterDisk[this.dialogDisk.index].totalCylinders}}<br>
                                        <strong>Heads: </strong>{{this.filterDisk[this.dialogDisk.index].totalHeads}}<br>
                                        <strong>Sectors: </strong>{{this.filterDisk[this.dialogDisk.index].totalSectors}}<br>
                                        <strong>Tracks: </strong>{{this.filterDisk[this.dialogDisk.index].totalTracks}}<br>
                                        <strong>Tracks per Cylinder: </strong>{{this.filterDisk[this.dialogDisk.index].tracksPerCylinder}}<br>
                                        <strong>Sectors per Track: </strong>{{this.filterDisk[this.dialogDisk.index].sectorsPerTrack}}<br>
                                    </div>
                                    <div>
                                        <strong>SMART: </strong>{{this.filterDisk[this.dialogDisk.index].smartStatus}}<br>
                                    </div>
                                </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogDisk.show = false;dialogDisk.index=0">Close</v-btn>
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
                dialogDisk: {
                    show: false,
                    index:0
                },
            }
        },
        computed: {
            filterDisk:function(){
                var newDisks = []
                this.$store.state.ressourcemonitor.filesystem.disks.forEach(function(element){
                    var skip = false;
                    if(element.device.includes("/dev/ram")){
                        skip=true;
                    }
                    if(!skip){
                        newDisks.push(element)
                    }
                })
                return newDisks
            }

        },
        methods: {
            openDiskDetails:function(index){
                this.dialogDisk.index=index
                this.dialogDisk.show = true
            }

        },
        mounted(){
        }
    }
</script>