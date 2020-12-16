<style>
    .webcamImage {
        width: 100%;
    }
</style>

<template>
    <v-card>
        <v-toolbar flat dense >
            <v-toolbar-title>
                <span class="subheading"><v-icon left>mdi-cog</v-icon>Hardware</span>
                <span class="subheading" v-if="!ressourcemanagerAviable" style="color:#D32F2F;">  Module not found!</span>
            </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
            <v-col class="py-0 px-3 equal-width">
                <v-row>
                    <v-col class="py-0 pl-0" style="max-width: 115px;">
                        <v-navigation-drawer permanent style="background: none;">
                            <v-list nav dense style="    margin-right: 3px;">
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
                    <v-col class="py-0" style="text-align: left;">
                        <strong>
                            <component v-bind:is="currentComponent" />
                        </strong>
                    </v-col>
                </v-row>
            </v-col>
        </v-card-text>
    </v-card>
</template>

<script>
    import CPU from "./Hardwareinfo/CPU";
    import RAM from "./Hardwareinfo/RAM";
    import General from "./Hardwareinfo/General";
    import {bus} from "../../../main";
    
    export default {
        components: {

        },
        data: () => ({
            selectedItem: 0,
            currentComponent: General,
        }),
        computed: {
            ressourcemanagerAviable: {
                get() {
                    return this.$store.state.gui.dashboard.boolRessourceMonitorAvailable;
                }
            },
            getContent: {
                get() {
                    return this.content;
                },
            },
            printerName: {
                get() {
                    return this.$store.state.gui.general.printername;
                },
                set(newName) {
                    return this.$store.dispatch('gui/setSettings', { general: { printername: newName } });
                }
            },
            virtualKeyboard: {
                get() {
                    return this.$cookies.isKey("enableVirtualKeyboard");
                },
                set(newStatus) {
                    var cookieValue
                    if(newStatus==false){
                        cookieValue = this.$cookies.remove('enableVirtualKeyboard')
                        bus.$emit("updatekeyboardcookie");
                        return cookieValue;
                    }
                    cookieValue = this.$cookies.set('enableVirtualKeyboard','default');
                    bus.$emit("updatekeyboardcookie");
                    return cookieValue;
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
                this.currentComponent=General
            },
            selectCPU:function(){
                this.currentComponent=CPU
            },
            selectRAM:function(){
                this.currentComponent=RAM
            },
        }
    }
</script>