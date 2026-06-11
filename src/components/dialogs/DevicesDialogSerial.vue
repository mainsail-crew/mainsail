<template>
    <v-card-text>
        <v-row>
            <v-col class="text-center">
                <v-btn :loading="loading" color="primary" @click="refresh">{{ $t('DevicesDialog.Refresh') }}</v-btn>
            </v-col>
        </v-row>
        <v-row v-if="filteredDevices.length" class="mt-0">
            <v-col>
                <v-expansion-panels accordion>
                    <devices-dialog-serial-device
                        v-for="device in filteredDevices"
                        :key="device.path_by_hardware ?? device.device_path"
                        :device="device" />
                </v-expansion-panels>
            </v-col>
        </v-row>
        <v-row v-else-if="loaded" class="mt-0">
            <v-col class="col-8 mx-auto">
                <p class="text-center text--disabled mb-0">{{ $t('DevicesDialog.NoDeviceFound') }}</p>
            </v-col>
        </v-row>
        <v-row v-else class="mt-0">
            <v-col class="col-8 mx-auto">
                <p class="text-center text--disabled mb-0">{{ $t('DevicesDialog.ClickRefresh') }}</p>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBase } from '@/composables/useBase'
import type { RPCResult } from '@/types/moonraker'
import type { SerialDevice } from '@/types/moonraker/MachineRPC'

const { apiUrl } = useBase()

const props = defineProps({
    hideSystemEntries: { type: Boolean, default: false },
})

const devices = ref<SerialDevice[]>([])
const loading = ref(false)
const loaded = ref(false)

const filteredDevices = computed(() => {
    if (!props.hideSystemEntries) return devices.value

    return devices.value.filter((device) => device.device_type !== 'hardware_uart')
})

async function refresh() {
    loading.value = true

    devices.value = await fetch(apiUrl.value + '/machine/peripherals/serial')
        .then((res) => res.json())
        .then((res: { result?: RPCResult<'machine.peripherals.serial'> }) => res.result?.serial_devices ?? [])

    loading.value = false
    loaded.value = true
}
</script>

<style scoped></style>
