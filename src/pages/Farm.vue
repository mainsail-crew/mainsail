<style>

</style>

<template>
    <v-row>
        <v-col
            v-for="(printer,key) in printers"
            v-bind:key="key"
            class="col-12 col-sm-6 col-md-4"
            >
            <farm-printer-panel v-bind:printer="printer"></farm-printer-panel>
        </v-col>
    </v-row>
</template>
<script>
    import FarmPrinterPanel from "@/components/panels/FarmPrinterPanel";

    export default {
        name: "farm",
        components: { FarmPrinterPanel },
        data () {
            return {

            }
        },
        computed: {
            printers: {
                get() {
                    return this.$store.getters["farm/getPrinters"]
                }
            }
        },
        methods: {

        }
    }
</script>