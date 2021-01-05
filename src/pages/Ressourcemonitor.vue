<template>
    <v-row>
        <v-col class="col-sm-10 col-md-2">
            <v-card style="">
                <v-toolbar flat dense >
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-view-dashboard</v-icon>Navigation</span>
                    </v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-col class="py-0 px-0 equal-width">
                        <v-row>
                            <v-col class="py-0 pl-0">
                                <v-navigation-drawer permanent dark style="background: none;">
                                    <v-list nav dense :disabled="!ressourcemanagerAviable">
                                        <v-list-item-group v-model="selectedItem" color="primary">
                                            <v-list-item>
                                                <v-list-item-content v-on:click="selectGeneral()">
                                                    <v-list-item-title><strong>General</strong></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-list-item-content v-on:click="selectCPU()">
                                                    <v-list-item-title><strong>CPU</strong></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-list-item-content  v-on:click="selectRAM()">
                                                    <v-list-item-title><strong>RAM</strong></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-list-item-content v-on:click="selectGPU()">
                                                    <v-list-item-title><strong>GPU</strong></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-list-item-content v-on:click="selectNetwork()">
                                                    <v-list-item-title><strong>Network</strong></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-list-item-content v-on:click="selectFilesystem()">
                                                    <v-list-item-title><strong>Filesystem</strong></v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list-item-group>
                                    </v-list>
                                </v-navigation-drawer>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col class="col-sm-12 col-md-3">
            <keep-alive>
                <component v-bind:is="currentHardwareComponent" />
            </keep-alive>
        </v-col>
        <v-col class="col-sm-12 col-md-7">
            <keep-alive>
                <component v-bind:is="currentSoftwareComponent" />
            </keep-alive>
        </v-col>
    </v-row>
    
    
</template>

<script>
    import HardwareCPU from "../components/ressourcemonitor/hardware/CPU";
    import HardwareRAM from "../components/ressourcemonitor/hardware/RAM";
    import HardwareGPU from "../components/ressourcemonitor/hardware/GPU";
    import HardwareNetwork from "../components/ressourcemonitor/hardware/Network";
    import HardwareFilesystem from "../components/ressourcemonitor/hardware/Filesystem";
    import HardwareGeneral from "../components/ressourcemonitor/hardware/General";
    import SoftwareCPU from "../components/ressourcemonitor/software/CPU";
    import SoftwareRAM from "../components/ressourcemonitor/software/RAM";
    import SoftwareGPU from "../components/ressourcemonitor/software/GPU";
    import SoftwareNetwork from "../components/ressourcemonitor/software/Network";
    import SoftwareFilesystem from "../components/ressourcemonitor/software/Filesystem";
    import SoftwareGeneral from "../components/ressourcemonitor/software/General";
    import {bus} from "../main";

    export default {
        components: { },
        data: () => ({
            selectedItem: 0,
            currentHardwareComponent: HardwareGeneral,
            currentSoftwareComponent: SoftwareGeneral,
        }),
        computed: {
            ressourcemanagerAviable: {
                get() {
                    return this.$store.state.gui.dashboard.boolRessourceMonitorAvailable;
                }
            },
        },
        methods: {
            show:function(e){
                bus.$emit("showkeyboard",e);
            },
            hide:function(){
                bus.$emit("hidekeyboard");
            },
            selectGeneral:function(){
                this.currentHardwareComponent=HardwareGeneral
                this.currentSoftwareComponent=SoftwareGeneral
            },
            selectCPU:function(){
                this.currentSoftwareComponent=SoftwareCPU
                this.currentHardwareComponent=HardwareCPU
            },
            selectGPU:function(){
                this.currentSoftwareComponent=SoftwareGPU
                this.currentHardwareComponent=HardwareGPU
            },
            selectRAM:function(){
                this.currentSoftwareComponent=SoftwareRAM
                this.currentHardwareComponent=HardwareRAM
            },
            selectNetwork:function(){
                this.currentSoftwareComponent=SoftwareNetwork
                this.currentHardwareComponent=HardwareNetwork
            },
            selectFilesystem:function(){
                this.currentSoftwareComponent=SoftwareFilesystem
                this.currentHardwareComponent=HardwareFilesystem
            },
        },
        mounted: function() {
            var here = this;
            setInterval(function(){
                if(!here.ressourcemanagerAviable){
                    here.selectGeneral(),
                    here.selectedItem=0
                }
            },1000)
        }
    }
</script>