<style></style>

<template>
    <v-row>
        <v-col v-for="(printer, key) in printers" :key="key" class="v-col-12 v-col-sm-6 v-col-md-4 pb-0">
            <farm-printer-panel :printer="printer"></farm-printer-panel>
        </v-col>
    </v-row>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useBase } from '@/composables/useBase'
import FarmPrinterPanel from '@/components/panels/FarmPrinterPanel.vue'

const store = useStore()
const { } = useBase()

const printers = computed(() => store.getters['farm/getPrinters'])
</script>
