
<template>
    <div>
        <strong> Total: </strong> {{(this.$store.state.ressourcemonitor.ram.total/1024/1024/1024).toFixed(2)}} GB<br>
        <strong> Used: </strong> {{(this.$store.state.ressourcemonitor.ram.used/1024/1024/1024).toFixed(2)}} GB<br>
        <strong> Swap Total: </strong> {{(this.$store.state.ressourcemonitor.ram.totalswap/1024/1024/1024).toFixed(2)}} GB<br>
        <strong> Swap Used: </strong> {{(this.$store.state.ressourcemonitor.ram.usedswap/1024/1024/1024).toFixed(2)}} GB<br>
        <div v-for="modules in this.$store.state.ressourcemonitor.ram.modules" :key="modules.bank">
            <strong> Slot: </strong> {{modules.bank}} <br>
            <strong style="padding-left: 15px;"> Manufacturer: </strong> {{modules.manufacturer}} <br>
            <strong style="padding-left: 15px;"> Modell: </strong><div style="padding-left: 20px;">{{modules.partNum}}</div>
            <strong style="padding-left: 15px;"> Size: </strong> {{(modules.size/1024/1024/1024).toFixed(2)}} GB<br>
            <strong style="padding-left: 15px;"> Frequency: </strong> {{modules.clockSpeed}} MHz<br>
        </div>
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