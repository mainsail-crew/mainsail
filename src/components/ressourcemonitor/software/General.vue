
<template>
    <div>
        <v-col class="py-0 px-0 equal-width ">
            <v-row>
                <v-col class="py-0 px-3" style="width:45%">
                    <v-card class="mb-5">
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
                    
                    <v-card class="mb-5">
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
        </v-col>
    </div>
</template>

<script>
    export default {
        components: {

        },
        data: () => ({
            
        }),
        computed: {

        },
        methods: {

        }
    }
</script>