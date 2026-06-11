<template>
    <v-card outlined class="mt-3 w-100">
        <v-card-text>
            <v-row>
                <v-col>
                    <div class="text-overline mb-2 d-flex flex-row">
                        <span>{{ device.application }}</span>
                    </div>
                </v-col>
            </v-row>
            <v-row class="mt-0">
                <v-col>
                    <textfield-with-copy label="UUID" :value="device.uuid" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import TextfieldWithCopy from '@/components/inputs/TextfieldWithCopy.vue'
import type { CanDevice } from '@/types/moonraker/MachineRPC'

defineProps({
    device: { type: Object as () => CanDevice, required: true },
})
</script>
