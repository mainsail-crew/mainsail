<style scoped></style>

<template>
    <v-menu bottom :offset-x="true">
        <template #activator="{ on, attrs }">
            <v-icon class="nav-arrow right" v-bind="attrs" v-on="on">{{ mdiChevronDown }}</v-icon>
        </template>

        <v-list dense>
            <v-list-item
                v-for="printer in printers"
                :key="printer._namespace"
                two-line
                :disabled="!printer.socket.isConnected"
                link
                @click="changePrinter(printer)">
                <v-list-item-content>
                    <v-list-item-title>{{ getPrinterName(printer._namespace) }}</v-list-item-title>
                    <v-list-item-subtitle>{{ getPrinterDescription(printer) }}</v-list-item-subtitle>
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

    get printers() {
        return this.$store.getters['farm/getPrinters']
    }

    get countPrinters() {
        return this.$store.getters['farm/countPrinters']
    }

    get currentPage() {
        return this.$route.fullPath
    }

    switchToPrinters() {
        router.push('/allPrinters')
    }

    getPrinterName(namespace: string) {
        return this.$store.getters['farm/' + namespace + '/getPrinterName']
    }

    getPrinterDescription(printer: FarmPrinterState) {
        return this.$store.getters['farm/' + printer._namespace + '/getStatus']
    }

    changePrinter(printer: FarmPrinterState) {
        if (printer.socket.isConnected) {
            this.$store.dispatch('changePrinter', { printer: printer._namespace })
        }
    }
}
</script>
