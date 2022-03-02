<style></style>

<template>
    <v-row>
        <v-col v-for="(printer, key) in printers" :key="key" class="col-12 col-sm-6 col-md-4 pb-0">
            <farm-printer-panel :printer="printer"></farm-printer-panel>
        </v-col>
    </v-row>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import FarmPrinterPanel from '@/components/panels/FarmPrinterPanel.vue'
@Component({
    components: { FarmPrinterPanel },
})
export default class PageFarm extends Mixins(BaseMixin) {
    get printers() {
        return this.$store.getters['farm/getPrinters']
    }
}
</script>
