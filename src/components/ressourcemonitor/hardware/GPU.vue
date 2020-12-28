
<template>
    <div>
        <v-card class="mb-5" v-if="this.$store.state.ressourcemonitor.gpu.length==0">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>GPU</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-1">
                                    HSInfoServer couldnt find any GPU
                                </v-col>
                            </v-row>
                            <v-row class="pb-3 px-0">
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        <v-card class="mb-5" v-for="(card, index) in this.$store.state.ressourcemonitor.gpu" :key="index">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>GPU {{index}}</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-1">
                                    <div @click="openGPUDetails(index)" v-bind:style="{marginTop:'-24px',marginBottom:'-24px',width: '175px',height:'175px',backgroundImage:'url('+require('@/assets/ressourcemonitor/gpu.png')+')',backgroundSize:'175px 175px'}">
                                        <div class="px-4 py-12" style="margin-left: 68px;font-size:10px">
                                            <strong>{{card.vendor}} </strong>
                                        </div>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        
       
        <v-dialog v-model="dialogGPU.show" max-width="400">
            <v-card>
                <v-card-title class="headline">GPU {{this.dialogGPU.index}} Details</v-card-title>
                <v-card-text>
                <v-row>
                    <v-col class="py-0 px-3 equal-width">
                        <v-row>
                                <v-col class="py-0 px-3">
                                    <div>
                                        <strong>Manufacturer: </strong>{{this.$store.state.ressourcemonitor.gpu[this.dialogGPU.index].vendor}}<br>
                                        <strong>Model: </strong>{{this.$store.state.ressourcemonitor.gpu[this.dialogGPU.index].model}}<br>
                                        <strong>Bus: </strong>{{this.$store.state.ressourcemonitor.gpu[this.dialogGPU.index].bus}}<br>
                                        <strong>Bus-ID: </strong>{{this.$store.state.ressourcemonitor.gpu[this.dialogGPU.index].pciBus}}<br>
                                        <strong>VRam: </strong>{{this.$store.state.ressourcemonitor.gpu[this.dialogGPU.index].vram}} MB<br>
                                        <strong>VRam Used: </strong>{{this.$store.state.ressourcemonitor.gpu[this.dialogGPU.index].memoryUsed}} MB<br>
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

    export default {
        components: {
        },
        data: function() {
            return {
                dialogGPU: {
                    show: false,
                    index:0
                },
            }
        },
        computed: {

        },
        methods: {
            openGPUDetails:function(index){
                this.dialogGPU.index=index
                this.dialogGPU.show = true
            }

        },
        mounted(){
        }
    }
</script>