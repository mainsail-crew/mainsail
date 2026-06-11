<template>
    <v-card outlined class="mt-3">
        <v-list-item lines="three">
            <div class="text-overline mb-2 d-flex flex-row">
                <span>{{ device.manufacturer ?? 'Unknown' }}</span>
                <v-spacer />
                <span>{{ device.vendor_id }}:{{ device.product_id }}</span>
            </div>
            <template #title>
                <span class="text-h5 mb-1">{{ device.product ?? 'Unknown' }}</span>
            </template>
            <template #subtitle v-if="device.description">
                <span>{{ device.description }}</span>
            </template>
        </v-list-item>
        <v-card-text class="pt-0">
            <v-row v-for="item in details" :key="item.key" class="mt-0">
                <v-col class="py-2" cols="3">{{ item.key }}</v-col>
                <v-col class="py-2">{{ item.value }}</v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UsbDevice } from '@/types/moonraker/MachineRPC'

const props = defineProps({
    device: { type: Object as () => UsbDevice, required: true },
})

const details = computed(() => {
    const keys = ['protocol', 'class', 'serial', 'usb_location'] as const
    const output: { key: string; value: string }[] = []

    keys.forEach((key) => {
        let value = props.device[key]
        if (value === null) return

        if (key === 'class' && props.device.subclass !== null) {
            value += `, ${props.device.subclass}`
        }

        output.push({ key, value })
    })

    return output
})
</script>
