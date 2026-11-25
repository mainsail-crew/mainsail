<template>
    <v-list-item two-line :disabled="!isConnected" link @click="changePrinter">
        <v-list-item-content>
            <v-list-item-title>{{ name }}</v-list-item-title>
            <v-list-item-subtitle>{{ status }}</v-list-item-subtitle>
        </v-list-item-content>
    </v-list-item>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { FarmPrinterState } from '@/store/farm/printer/types'
import Vue from 'vue'

@Component
export default class PrinterSelectorItem extends Vue {
    @Prop({ type: Object, required: true }) readonly printer!: FarmPrinterState

    get isConnected(): boolean {
        return this.printer.socket.isConnected
    }

    get name(): string {
        return this.$store.getters[`farm/${this.printer.id}/printerName`]
    }

    get status(): string {
        return this.$store.getters[`farm/${this.printer.id}/statusText`]
    }

    changePrinter() {
        if (!this.printer.socket.isConnected) return

        this.$store.dispatch('changePrinter', { printer: this.printer.id })
    }
}
</script>
