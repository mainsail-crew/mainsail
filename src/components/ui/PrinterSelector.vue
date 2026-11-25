<style scoped></style>

<template>
    <v-menu bottom :offset-x="true">
        <template #activator="{ on, attrs }">
            <v-icon class="nav-arrow right" v-bind="attrs" v-on="on">{{ mdiChevronDown }}</v-icon>
        </template>

        <v-list dense>
            <v-list-item
                v-for="printer in printers"
                :key="printer.id"
                two-line
                :disabled="!printer.socket.isConnected"
                link
                @click="changePrinter(printer)">
                <v-list-item-content>
                    <v-list-item-title>{{ getPrinterName(printer.id) }}</v-list-item-title>
                    <v-list-item-subtitle>{{ getPrinterStatus(printer.id) }}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import router from '@/plugins/router'
import { FarmPrinterState } from '@/store/farm/printer/types'
import { mdiChevronDown } from '@mdi/js'

@Component
export default class PrinterSelector extends Mixins(BaseMixin) {
    /**
     * Icons
     */
    mdiChevronDown = mdiChevronDown

    get displayMenuPoint() {
        return (
            (this.instancesDB !== 'moonraker' && this.countPrinters > 1) ||
            (this.instancesDB === 'moonraker' && this.countPrinters)
        )
    }

    get printers(): FarmPrinterState[] {
        return this.$store.getters['farm/printers']
    }

    get countPrinters(): number {
        return this.$store.getters['farm/printerCount']
    }

    get currentPage() {
        return this.$route.fullPath
    }

    switchToPrinters() {
        router.push('/allPrinters')
    }

    getPrinterName(id: string): string {
        return this.$store.getters[`farm/${id}/printerName`]
    }

    getPrinterStatus(id: string): string {
        return this.$store.getters[`farm/${id}/statusText`]
    }

    changePrinter(printer: FarmPrinterState) {
        if (!printer.socket.isConnected) return

        this.$store.dispatch('changePrinter', { printer: printer.id })
    }
}
</script>
