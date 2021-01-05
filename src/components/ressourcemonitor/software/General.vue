
<template>
    <div>
        <v-col class="py-0 px-0 equal-width " v-if="ressourcemanagerAviable">
            <v-row>
                <v-col class="py-0 px-3" style="width:45%">
                    <v-card class="mb-3">
                        <v-toolbar flat dense >
                            <v-toolbar-title>
                                <span class="subheading"><v-icon left>mdi-memory</v-icon>Mainboard</span>
                            </v-toolbar-title>
                        </v-toolbar>
                        <v-card-text class="py-1">
                            <v-col class="py-0 px-3 pt-3 equal-width">
                                <v-row>
                                    <v-col class="py-0 px-3 equal-width">
                                        <v-row class="pb-3 px-0">
                                            <v-col class="py-0 px-2 ml-2 mt-2 col-md-5">
                                                <div v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '100px',height:'100px',backgroundImage:'url('+require('@/assets/ressourcemonitor/mainboard.png')+')',backgroundSize:'100px 100px'}">
                                                </div>
                                            </v-col>
                                            <v-col class="py-0 px-0">
                                                <strong>Manufacturer: </strong>{{this.$store.state.ressourcemonitor.mainboard.manufacturer}}<br>
                                                <strong>Model: </strong>{{this.$store.state.ressourcemonitor.mainboard.model}}<br>
                                                <strong>Version: </strong>{{this.$store.state.ressourcemonitor.mainboard.version}}<br>
                                                <strong>BIOS Vendor: </strong>{{this.$store.state.ressourcemonitor.bios.vendor}}<br>
                                                <strong>BIOS Version: </strong>{{this.$store.state.ressourcemonitor.bios.version}}<br>
                                                <strong>BIOS Release: </strong>{{this.$store.state.ressourcemonitor.bios.releaseDate}}<br>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col class="py-0 px-3" style="width:45%">
                    <v-card class="mb-3">
                        <v-toolbar flat dense >
                            <v-toolbar-title>
                                <span class="subheading"><v-icon left>mdi-desktop-classic</v-icon>System</span>
                            </v-toolbar-title>
                        </v-toolbar>
                        <v-card-text class="py-1">
                            <v-col class="py-0 px-3 pt-3 equal-width">
                                <v-row>
                                    <v-col class="py-0 px-3 equal-width">
                                        <v-row class="pb-3 px-0">
                                            <v-col class="py-0 px-2 ml-2 mt-2 col-md-5">
                                                <div v-bind:style="{marginTop:'0px',marginBottom:'0px',width: '100px',height:'100px',backgroundImage:'url('+require('@/assets/ressourcemonitor/system.png')+')',backgroundSize:'100px 100px'}">
                                                </div>
                                            </v-col>
                                            <v-col class="py-0 px-0">
                                                <strong>Manufacturer: </strong>{{this.$store.state.ressourcemonitor.system.manufacturer}}<br>
                                                <strong>Model: </strong>{{this.$store.state.ressourcemonitor.system.model}}<br>
                                                <strong>Version: </strong>{{this.$store.state.ressourcemonitor.system.version}}<br>
                                                <strong>SKU: </strong>{{this.$store.state.ressourcemonitor.system.sku}}<br>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-card class="">
                        <v-toolbar flat dense >
                            <v-toolbar-title>
                                <span class="subheading"><v-icon left>mdi-apps</v-icon>Processes</span>
                            </v-toolbar-title>
                            <div style="position: absolute;right: 20px;">
                                <v-text-field
                                    v-model="search"
                                    append-icon="mdi-magnify"
                                    label="Search"
                                    single-line
                                    hide-details
                                    @click.native="show"
                                    @blur="hide"
                                ></v-text-field>
                            </div>
                        </v-toolbar>
                        <v-data-table
                            dense
                            :headers="headers"
                            :items="this.$store.state.ressourcemonitor.processes"
                            :items-per-page="8"
                            class="elevation-0"
                            :search="search"
                            :footer-props="{
                                showFirstLastPage: true,
                                itemsPerPageOptions: [8],
                                firstIcon: 'mdi-arrow-collapse-left',
                                lastIcon: 'mdi-arrow-collapse-right',
                                prevIcon: 'mdi-arrow-left',
                                nextIcon: 'mdi-arrow-right'
                            }"
                        ></v-data-table>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
    </div>
</template>

<script>
    import {bus} from "@/main";
    export default {
        components: {

        },
        data: () => ({
            search: "",
            headers: [
                {
                    text: 'pid',
                    align: 'start',
                    value: 'pid'
                },
                {
                    text: 'Name',
                    value: 'name'
                },
                {
                    text: 'CPULoad (%)',
                    value: 'pcpu'
                },
                {
                    text: 'MemLoad (%)',
                    value: 'pmem'
                },
                {
                    text: 'MemLoad (MB)',
                    value: 'mem_rss'
                },
                {
                    text: 'Path',
                    value: 'path'
                }
            ]
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

        }
    }
</script>