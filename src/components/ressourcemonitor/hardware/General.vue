
<template>
    <div>
        <v-card class="mb-5">
            <v-toolbar flat dense >
                <v-toolbar-title>
                    <span class="subheading"><v-icon left>mdi-memory</v-icon>OS</span>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="py-1">
                <v-col class="py-0 px-3 pt-3 equal-width">
                    <v-row>
                        <v-col class="py-0 px-3 equal-width">
                            <v-row class="pb-3 px-0">
                                <v-col class="py-0 px-2 ml-2 mt-2" style="margin-right:-35px">
                                    <div v-if="this.$store.state.ressourcemonitor.os.platform=='win32'||this.$store.state.ressourcemonitor.platform=='win64'" v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '80px',height:'80px',backgroundImage:'url('+getLogo+')',backgroundSize:'80px 80px'}">
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
        <v-row>
            Soon TM
            {{this.$store.state.ressourcemonitor.os}}
        </v-row>
    </div>
</template>

<script>
    export default {
        components: {

        },
        data: () => ({
            
        }),
        computed: {
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