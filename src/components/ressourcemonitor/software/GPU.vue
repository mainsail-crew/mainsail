
<template>
    <div>
        <v-card class="mb-5" v-if="this.$store.state.ressourcemonitor.screens.length==0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>Display Configuration</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-1">
                                    HSInfoServer couldnt find any Screens
                                </v-col>
                            </v-row>
                            <v-row class="pb-3 px-0">
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>

        <v-card class="mb-5" v-if="this.$store.state.ressourcemonitor.screens.length>0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>Display Configuration</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-1" v-for="(screen, index) in this.$store.state.ressourcemonitor.screens" :key="index">
                                    <div @click="openGPUDetails(screen,index)" v-bind:style="{marginTop:'4px',width: '175px',height:'150px',backgroundImage:'url('+require('@/assets/ressourcemonitor/screen.png')+')',backgroundSize:'175px 150px'}">
                                        <div class="px-4 py-6" style="margin-left: 58px;color:black;transform: rotate(-30deg);">
                                            <strong>{{calculateDiagonale(screen.sizex,screen.sizey)}}"</strong>
                                        </div>
                                        <div class="px-4 py-4" style="margin-top: 4px;margin-left: 135px;color: black;">
                                            <strong>{{index}}</strong> 
                                        </div>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        
        <v-card height=200 class="mb-5" v-if="this.$store.state.ressourcemonitor.gpu.cards.length!=0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-fire</v-icon>Temperature</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width pt-2">
                    <v-row>
                        <v-col class="py-0 px-3">
                            <keep-alive>
                                <GPUTemp></GPUTemp>
                            </keep-alive>
                        </v-col> 
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        
        <v-col class="py-0 px-0 equal-width ">
            <v-row>
                <v-col class="py-0 px-3" style="width:45%">
                    <v-card height=250 class="mb-5" v-if="this.$store.state.ressourcemonitor.gpu.cards.length!=0">
                        <v-toolbar flat dense >
                            <v-toolbar-title>
                                <span class="subheading"><v-icon left>mdi-chart-donut</v-icon>Core Usage</span>
                            </v-toolbar-title>
                        </v-toolbar>
                        <v-card-text class="py-1">
                            <v-col class="py-0 px-3 equal-width pt-2">
                                <v-row>
                                    <v-col class="py-0 px-3">
                                        <keep-alive>
                                            <GPUCore></GPUCore>
                                        </keep-alive>
                                    </v-col> 
                                </v-row>
                            </v-col>
                        </v-card-text>
                    </v-card>
                </v-col> 
                
                <v-col class="py-0 px-3" style="width:45%">
                    <v-card height=250 class="mb-5" v-if="this.$store.state.ressourcemonitor.gpu.cards.length!=0">
                        <v-toolbar flat dense >
                            <v-toolbar-title>
                                <span class="subheading"><v-icon left>mdi-chart-donut</v-icon>Mem Usage</span>
                            </v-toolbar-title>
                        </v-toolbar>
                        <v-card-text class="py-1">
                            <v-col class="py-0 px-3 equal-width pt-2">
                                <v-row>
                                    <v-col class="py-0 px-3">
                                        <keep-alive>
                                            <GPUMem></GPUMem>
                                        </keep-alive>
                                    </v-col> 
                                </v-row>
                            </v-col>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
        
       
        <v-dialog v-model="dialogGPU.show" max-width="400">
            <v-card>
                <v-card-title class="headline">Screen {{this.dialogGPU.index}} Details</v-card-title>
                <v-card-text>
                <v-row>
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                                <v-col class="py-0 px-3">
                                    <div>
                                        <strong>Manufacturer: </strong>{{this.dialogGPU.screen.vendor}}<br>
                                        <strong>Model: </strong>{{this.dialogGPU.screen.model}}<br>
                                        <strong>Connection: </strong>{{this.dialogGPU.screen.connection}}<br>
                                        <strong>Pixeldepth: </strong>{{this.dialogGPU.screen.pixeldepth}}bit<br>
                                        <strong>Resolution: </strong>{{this.dialogGPU.screen.resolutionx}}x{{this.dialogGPU.screen.resolutiony}}<br>
                                        <strong>Refresh Rate: </strong>{{this.dialogGPU.screen.currentRefreshRate}}hz<br>
                                        <strong>Size (Panel): </strong>{{this.dialogGPU.screen.sizex}}x{{this.dialogGPU.screen.sizey}}cm<br>
                                    </div>
                                </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="" text @click="dialogGPU.show = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import GPUTemp from '@/charts/GPUTemp'
    import GPUCore from '@/charts/GPUCore'
    import GPUMem from '@/charts/GPUMem'

    export default {
        components: {
            GPUTemp,
            GPUCore,
            GPUMem
        },
        data: function() {
            return {
                dialogGPU: {
                    show: false,
                    index:0,
                    screen: []
                },
            }
        },
        computed: {

        },
        methods: {
            calculateDiagonale(x,y){
                return (Math.sqrt((x*x)+(y*y))/2.54).toFixed(0)
            },
            openGPUDetails:function(screen,index){
                this.dialogGPU.index=index
                this.dialogGPU.screen=screen
                this.dialogGPU.show = true
            }

        },
        mounted(){
        }
    }
</script>