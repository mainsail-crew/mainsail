<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-list-subheader class="_miscellaneous-sensor-subheader">
                    <v-icon small class="mr-2">{{ unitToSymbol(unit) }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer />
                    <span>{{ output }}</span>
                </v-list-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { convertName, unitToSymbol } from '@/plugins/helpers'

const props = defineProps<{
    name: string
    value: number
    unit?: string
}>()

const output = computed(() => {
    const val = isNaN(props.value) ? '--' : props.value
    if (!props.unit) return val
    return `${val} ${props.unit}`
})
</script>

<style scoped>
._miscellaneous-sensor-subheader {
    height: auto;
}
</style>
