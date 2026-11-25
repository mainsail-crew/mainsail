<template>
    <v-row>
        <v-col v-for="printer in printers" :key="printer.id" class="col-12 col-sm-6 col-md-4 pb-0">
            <farm-printer-panel :printer="printer" />
        </v-col>
    </v-row>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import FarmPrinterPanel from '@/components/panels/FarmPrinterPanel.vue'
import { FarmPrinterState } from '@/store/farm/printer/types'

@Component({
    components: { FarmPrinterPanel },
})
export default class PageFarm extends Vue {
    get printers(): FarmPrinterState[] {
        return this.$store.getters['farm/printers']
    }
}
</script>
