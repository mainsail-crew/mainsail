
<template>
    <div>
        {{this.freqchartdata.datasets}}
    </div>
</template>

<script>
    import { mapState } from 'vuex'

    export default {
        components: {
        },
        data: function() {
            return {
                dialogCPU: {
                    show: false,
                },
                freqchartdata: {
                    datasets: []
                },
            }
        },
        computed: {
            ...mapState ({
                freqdatasets: state => state.ressourcemonitor.cpuFreqHistory.datasets,
            }),
            minimizeChart() {
                return {height: '130px'}
            },
            freqdatasets: {
                get () {
                    return this.$store.state.ressourcemonitor.cpuFreqHistory.datasets
                }
            },
        },
        methods: {

        },
        mounted(){
            this.freqchartdata = {
                datasets: this.freqdatasets
            }
        }
    }
</script>