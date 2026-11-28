<template>
    <v-menu bottom :offset-x="true">
        <template #activator="{ on, attrs }">
            <v-icon class="nav-arrow right" v-bind="attrs" v-on="on">{{ mdiChevronDown }}</v-icon>
        </template>

        <v-list dense>
            <printer-selector-item v-for="printer in printers" :key="printer.id" :printer="printer" />
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import { FarmPrinterState } from '@/store/farm/printer/types'
import { mdiChevronDown } from '@mdi/js'
import PrinterSelectorItem from '@/components/ui/PrinterSelectorItem.vue'
import Vue from 'vue'

@Component({ components: { PrinterSelectorItem } })
export default class PrinterSelector extends Vue {
    mdiChevronDown = mdiChevronDown

    get printers(): FarmPrinterState[] {
        return this.$store.getters['farm/printers']
    }
}
</script>
