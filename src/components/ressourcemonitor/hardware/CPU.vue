
<template>
    <div>
        <strong> Manufacturer: </strong> {{this.$store.state.ressourcemonitor.cpu.vendor}} <br>
        <strong> Name: </strong> {{this.$store.state.ressourcemonitor.cpu.brand}} <br>
        <strong> Cores: </strong> {{this.$store.state.ressourcemonitor.cpu.cores}} <br>
        <strong> Threads: </strong> {{this.$store.state.ressourcemonitor.cpu.threads}} <br>
        <strong> Socket: </strong> {{this.$store.state.ressourcemonitor.cpu.socket}} <br>
        <strong> Current Frequency: </strong> {{this.$store.state.ressourcemonitor.cpu.freqcores}} GHz<br>
        <strong> Min Frequency: </strong> {{this.$store.state.ressourcemonitor.cpu.freqmin}} GHz<br>
        <strong> Max Frequency: </strong> {{this.$store.state.ressourcemonitor.cpu.freqmax}} GHz<br>
        <strong> Current Temp: </strong> {{this.$store.state.ressourcemonitor.cpu.temp}} °C<br>
        <strong> Current Load: </strong> {{this.$store.state.ressourcemonitor.cpu.load}} %<br>
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