
<template>
    <div>
        <v-col class="py-0 px-0 equal-width ">
            <v-row v-for="(partition, index) in this.$store.state.ressourcemonitor.filesystem.partitions" :key="index">
                <v-col class="py-0 px-3">
                    <v-card class="mb-5">
                        <v-toolbar flat dense >
                            <v-toolbar-title>
                                <span class="subheading"><v-icon left>mdi-folder-outline</v-icon>Partition {{partition.fs}}</span>
                            </v-toolbar-title>
                        </v-toolbar>
                        <v-card-text class="py-1">
                            <v-col class="py-0 px-8 equal-width pt-2">
                                <v-row> 
                                    <v-col class="py-0 px-3" style="width: 120px;">
                                        <keep-alive>
                                            <FSUsage :partition='partition.fs'></FSUsage>
                                        </keep-alive>
                                    </v-col> 
                                </v-row>
                                <v-row>
                                    <v-col class="py-0 pl-1">
                                        
                                    </v-col>
                                    <v-col class="py-5 px-1">
                                        <div v-bind:style="{fontSize:'10px',marginTop:'0px',marginBottom:'0px',width: '160px',height:'40px',backgroundImage:'url('+require('@/assets/ressourcemonitor/partition.png')+')'}">
                                            <div style="color: rgb(76, 76, 76);margin-top: -1px;margin-bottom: -22px;margin-left: 104px;">
                                                Info
                                            </div>
                                            <div class="pl-2 pt-1" style="line-height: 17px;">
                                                <strong>Mount:</strong> {{partition.mount}} <br>
                                                <strong>Type:</strong> {{partition.type}}
                                            </div>
                                        </div>
                                    </v-col> 
                                    <v-col class="py-0 pl-1">
                                        
                                    </v-col>
                                    <v-col class="py-5 px-1">
                                        <div v-bind:style="{fontSize:'10px',marginTop:'0px',marginBottom:'0px',width: '160px',height:'40px',backgroundImage:'url('+require('@/assets/ressourcemonitor/partition.png')+')'}">
                                            <div style="color: rgb(76, 76, 76);margin-top: -1px;margin-bottom: -29px;margin-left: 87px;">
                                                Storage
                                            </div>
                                            <div class="pl-2 pt-1 mt-2" style="line-height: 17px;">
                                                <strong>Size:</strong> {{(partition.size/1024/1024/1024).toFixed(2)}} GB<br>
                                                <strong>Used:</strong> {{(partition.used/1024/1024/1024).toFixed(2)}} GB<br>
                                            </div>
                                        </div>
                                    </v-col> 
                                    <v-col class="py-0 pl-1">
                                        
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-card-text>
                    </v-card>
                </v-col> 
            </v-row>
        </v-col>
    </div>
</template>

<script>
    import FSUsage from '@/charts/FSUsage'

    export default {
        components: {
            FSUsage
        },
        data: function() {
            return{

            }
        },
        computed: {

        },
        methods: {

        },
        mounted(){
        }
    }
</script>