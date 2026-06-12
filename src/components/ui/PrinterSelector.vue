<style scoped></style>

<template>
    <v-menu bottom :offset-x="true">
        <template #activator="{ on, attrs }">
            <v-icon class="nav-arrow right" v-bind="attrs" v-on="on">{{ mdiChevronDown }}</v-icon>
        </template>

        <v-list density="compact">
            <v-list-item
                v-for="printer in printers"
                :key="printer._namespace"
                lines="two"
                :disabled="!printer.socket.isConnected"
                link
                @click="changePrinter(printer)"
                :title="getPrinterName(printer._namespace)"
                :subtitle="getPrinterDescription(printer)">
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useBase } from '@/composables/useBase'
import router from '@/plugins/router'
import { FarmPrinterState } from '@/store/farm/printer/types'
import { mdiChevronDown } from '@mdi/js'

const store = useStore()
const route = useRoute()
const { instancesDB } = useBase()

const countPrinters = computed(() => store.getters['farm/countPrinters'])
const printers = computed(() => store.getters['farm/getPrinters'])
const currentPage = computed(() => route.fullPath)

function getPrinterName(namespace: string) {
    return store.getters['farm/' + namespace + '/getPrinterName']
}

function getPrinterDescription(printer: FarmPrinterState) {
    return store.getters['farm/' + printer._namespace + '/getStatus']
}

function changePrinter(printer: FarmPrinterState) {
    if (printer.socket.isConnected) {
        store.dispatch('changePrinter', { printer: printer._namespace })
    }
}

function switchToPrinters() {
    router.push('/allPrinters')
}
</script>
