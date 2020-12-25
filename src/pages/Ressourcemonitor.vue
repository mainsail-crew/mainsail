<template>
    <v-row>
        <v-col class="col-sm-10 col-md-2">
            <v-card style="">
                <v-toolbar flat dense >
                    <v-toolbar-title>
                        <span class="subheading"><v-icon left>mdi-view-dashboard</v-icon>Navigation</span>
                        <span class="subheading" v-if="!ressourcemanagerAviable" style="color:#D32F2F;">  Module not found!</span>
                    </v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-col class="py-0 px-0 equal-width">
                        <v-row>
                            <v-col class="py-0 pl-0">
                                <v-navigation-drawer permanent dark style="background: none;">
                                    <v-list nav dense>
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
                                        </v-list-item-group>
                                    </v-list>
                                </v-navigation-drawer>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col v-if="showGeneral" class="col-sm-12 col-md-7">
            <general v-if="showGeneral"/>
        </v-col>
        <v-col v-if="!showGeneral" class="col-sm-12 col-md-3">
            <component v-if="!showGeneral" v-bind:is="currentHardwareComponent" />
        </v-col>
        <v-col v-if="!showGeneral" class="col-sm-12 col-md-7">
            <component v-if="!showGeneral" v-bind:is="currentSoftwareComponent" />
        </v-col>
    </v-row>
    
</template>

<script>
    import HardwareCPU from "../components/ressourcemonitor/hardware/CPU";
    import HardwareRAM from "../components/ressourcemonitor/hardware/RAM";
    import SoftwareCPU from "../components/ressourcemonitor/software/CPU";
    import SoftwareRAM from "../components/ressourcemonitor/software/RAM";
    import General from "../components/ressourcemonitor/General";
    import {bus} from "../main";

    export default {
        components: {General },
        data: () => ({
            selectedItem: 0,
            currentHardwareComponent: General,
            currentSoftwareComponent: General,
            showGeneral: true,
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
                this.showGeneral=true
                bus.$emit("resetChart");
                this.currentHardwareComponent=General
                this.currentSoftwareComponent=General
            },
            selectCPU:function(){
                this.showGeneral=false
                bus.$emit("resetChart");
                this.currentSoftwareComponent=SoftwareCPU
                this.currentHardwareComponent=HardwareCPU
            },
            selectRAM:function(){
                this.showGeneral=false
                bus.$emit("resetChart");
                this.currentSoftwareComponent=SoftwareRAM
                this.currentHardwareComponent=HardwareRAM
            },
        }
    }
</script>