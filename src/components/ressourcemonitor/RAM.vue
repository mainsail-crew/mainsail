
<template>
    <div>
        <v-row>
            <v-col class="py-0 px-3 equal-width" style="max-width: 200px">
                    <v-row class="pb-3">
                        
                        <v-col class="py-0 px-0" v-for="modules in this.$store.state.ressourcemonitor.ram.modules" :key="modules.bank" style="writing-mode:vertical-lr;margin-left: -4px;">
                            <strong>{{modules.bank}} </strong>
                        </v-col>
                        
                    </v-row>
                    <v-row>
                        <v-col class="py-0 pl-0" v-for="modules in this.$store.state.ressourcemonitor.ram.modules" :key="modules.bank">
                            
                            <img :src="require('../../assets/ressourcemonitor/ram_empty.png')">
                        </v-col>
                    </v-row>
                    <v-row>
                        <strong> Total: </strong> {{(this.$store.state.ressourcemonitor.ram.total/1024/1024/1024).toFixed(2)}} GB<br>
                        <strong> Used: </strong> {{(this.$store.state.ressourcemonitor.ram.used/1024/1024/1024).toFixed(2)}} GB<br>
                        <strong> Swap Total: </strong> {{(this.$store.state.ressourcemonitor.ram.totalswap/1024/1024/1024).toFixed(2)}} GB<br>
                        <strong> Swap Used: </strong> {{(this.$store.state.ressourcemonitor.ram.usedswap/1024/1024/1024).toFixed(2)}} GB<br>
                    </v-row>
            
            </v-col>
            
            <v-col class="py-0 px-3 equal-width">
                <v-row>
                    
                    <v-col class="py-0 pl-0">
                        <strong>Placeholder</strong>
                    </v-col>
                    
                </v-row>
           </v-col> 
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
            
        },
        methods: {

        }
    }
</script>