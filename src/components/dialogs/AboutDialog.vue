<template>
    <v-tooltip location="right" color="panel">
        <template #activator="{ props }">
            <v-icon v-bind="props">
                {{ mdiHelpCircleOutline }}
            </v-icon>
        </template>
        <v-container class="version-container pa-0">
            <div><img height="12" src="/img/logo.svg" alt="mainsail-logo" /></div>
            <div>v{{ mainsailVersion }}</div>
            <div>
                <v-icon size="small" class="moonraker-logo">{{ mdiMoonWaningCrescent }}</v-icon>
            </div>
            <div>{{ moonrakerVersion }}</div>
            <div><img height="12" src="/img/klipper.svg" class="klipper-logo" alt="klipper-logo" /></div>
            <div>{{ klipperVersion }}</div>
        </v-container>
    </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { mdiHelpCircleOutline, mdiMoonWaningCrescent } from '@mdi/js'

const store = useStore()

const mainsailVersion = computed(() => store.state.packageVersion)

const klipperVersion = computed(() => store.state.printer?.software_version ?? '')

const moonrakerVersion = computed(() => store.state.server?.moonraker_version ?? '')
</script>

<style scoped>
.klipper-logo {
    transform: rotate(90deg);
}
.moonraker-logo {
    transform: rotate(45deg);
    color: #ebc815;
}
.version-container {
    display: grid;
    grid-template-columns: 20px auto;
}
</style>
