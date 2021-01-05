
<template>
    <div>
        <v-card class="mb-5" v-if="!ressourcemanagerAviable">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading" style="color:#D32F2F;"><v-icon left style="color:#D32F2F;">mdi-collage</v-icon>Module not Found!</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-2 px-2">
                                    <span>Please configure in the Settings the hsinfoserver</span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        <v-card class="mb-5" v-if="ressourcemanagerAviable">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-collage</v-icon>OS</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-2 ml-2 mt-2 col-md-5">
                                    <div v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+getLogo+')',backgroundSize:'80px 80px'}">
                                    </div>
                                </v-col>
                                <v-col class="py-0 px-0">
                                    <strong>Distro: </strong>{{this.$store.state.ressourcemonitor.os.distro}}<br>
                                    <strong>Release: </strong>{{this.$store.state.ressourcemonitor.os.release}}<br>
                                    <strong>Codename: </strong>{{this.$store.state.ressourcemonitor.os.codename}}<br>
                                    <strong>Build: </strong>{{this.$store.state.ressourcemonitor.os.build}}<br>
                                    <strong>Kernel: </strong>{{this.$store.state.ressourcemonitor.os.kernel}}<br>
                                    <strong>Hostname: </strong>{{this.$store.state.ressourcemonitor.os.hostname}}<br>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
        
        <v-card class="mb-5" v-if="ressourcemanagerAviable">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-collage</v-icon>Load</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 pr-1">
                            <v-row class="py-0 px-0">
                                <v-col class="py-0 px-0">
                                    <div style="padding-top: 6px;">
                                        <v-progress-linear :color="getCPUColor" height="8" v-model="this.$store.state.ressourcemonitor.cpu.load"></v-progress-linear>
                                    </div>
                                </v-col>
                                <v-col class="py-0 pl-3 px-0 col-md-6">
                                    <strong>CPU: </strong>{{(this.$store.state.ressourcemonitor.cpu.load+1-1).toFixed(0)}}%<br>
                                </v-col>
                            </v-row>
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-0">
                                    <div style="padding-top: 6px;">
                                        <v-progress-linear :color="getRAMColor" height="8" v-model="getRAMBar"></v-progress-linear>
                                    </div>
                                </v-col>
                                <v-col class="py-0 pl-3 px-0 col-md-6">
                                    <strong>RAM: </strong>{{(this.$store.state.ressourcemonitor.ram.used/1024/1024/1024).toFixed(0)}}
                                    /
                                    {{(this.$store.state.ressourcemonitor.ram.total/1024/1024/1024).toFixed(0)}} GB<br>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    export default {
        components: {

        },
        data: () => ({
            
        }),
        computed: {
            ressourcemanagerAviable: {
                get() {
                    return this.$store.state.gui.dashboard.boolRessourceMonitorAvailable;
                }
            },
            getRAMBar:function(){
                var used = this.$store.state.ressourcemonitor.ram.used;
                var total = this.$store.state.ressourcemonitor.ram.total;
                return (100/total)*used

            },
            getCPUColor:function(){
                if(this.$store.state.ressourcemonitor.cpu.load>=80){
                    return "red"
                }
                return "blue"
            },
            getRAMColor:function(){
                if(this.getRAMBar>=80){
                    return "red"
                }
                return "blue"
            },
            getLogo:function(){
                var logofile = this.$store.state.ressourcemonitor.os.logofile
                var logo = require('@/assets/ressourcemonitor/os_'+logofile+'.png')
                return logo
            }
        },
        methods: {

        }
    }
</script>