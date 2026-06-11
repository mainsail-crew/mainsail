<template>
    <panel v-if="klipperReadyForGui" :icon="mdiConsole" title="MDI" :collapsible="true" card-class="mdi-panel">
        <v-container class="py-2">
            <p>This is the MDI Panel placeholder.</p>
        </v-container>
    </panel>
</template>

<script setup lang="ts">
import { useBase } from '@/composables/useBase'
import { useControl } from '@/composables/useControl'
import Panel from '@/components/ui/Panel.vue'
import { mdiConsole } from '@mdi/js'

useBase()
useControl()
</script>

<style scoped>
</style>
