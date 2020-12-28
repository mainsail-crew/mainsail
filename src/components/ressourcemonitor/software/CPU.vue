
<template>
    <div>
        <v-card height=300>
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-fire</v-icon>Temperature</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 pt-2">
                            <keep-alive>
                                <CPUTemp></CPUTemp>
                            </keep-alive>
                        </v-col> 
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        <v-card height=300 style="margin-top:25px">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-chart-donut</v-icon>Usage</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 pt-2">
                            <keep-alive>
                                <CPULoad></CPULoad>
                            </keep-alive>
                        </v-col> 
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import CPULoad from '@/charts/CPULoad'
    import CPUTemp from '@/charts/CPUTemp'
    export default {
        components: {
            CPUTemp,
            CPULoad
        },
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

        },
        mounted(){

        }
    }
</script>