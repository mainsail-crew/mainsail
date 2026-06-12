<template>
    <v-card variant="outlined" class="mt-3 w-100">
        <v-list-item lines="three">
            <div class="text-overline mb-2 d-flex flex-row">
                <span>{{ device.device_type.toUpperCase().replaceAll('_', ' ') }}</span>
                <v-spacer />
                <span>{{ device.driver_name }}</span>
            </div>
            <template #title>
                <span class="text-h5 mb-0">{{ device.device_name }}</span>
            </template>
        </v-list-item>
        <v-card-text>
            <v-row>
                <v-col>
                    <textfield-with-copy :label="$t('DevicesDialog.DevicePath')" :value="device.device_path" />
                </v-col>
            </v-row>
            <v-row v-if="device.path_by_id ?? false">
                <v-col>
                    <textfield-with-copy :label="$t('DevicesDialog.PathById')" :value="device.path_by_id" />
                </v-col>
            </v-row>
            <v-row v-if="device.path_by_hardware ?? false">
                <v-col>
                    <textfield-with-copy :label="$t('DevicesDialog.PathByHardware')" :value="device.path_by_hardware" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import TextfieldWithCopy from '@/components/inputs/TextfieldWithCopy.vue'
import type { SerialDevice } from '@/types/moonraker/MachineRPC'

defineProps({
    device: { type: Object as () => SerialDevice, required: true },
})
</script>
