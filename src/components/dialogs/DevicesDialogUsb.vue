<template>
    <v-card-text>
        <v-row>
            <v-col class="text-center">
 <v-btn :loading="loading" color="primary" @click="refresh">{{ $t('DevicesDialog.Refresh') }}</v-btn>
            </v-col>
        </v-row>
        <v-row v-if="filteredDevices.length" class="mt-0">
            <v-col>
                <devices-dialog-usb-device
                    v-for="device in filteredDevices"
                    :key="device.usb_location"
                    :device="device" />
            </v-col>
        </v-row>
        <v-row v-else-if="loaded" class="mt-0">
            <v-col class="v-col-8 mx-auto">
                <p class="text-center text-disabled mb-0">{{ $t('DevicesDialog.NoDeviceFound') }}</p>
            </v-col>
        </v-row>
        <v-row v-else class="mt-0">
            <v-col class="v-col-8 mx-auto">
                <p class="text-center text-disabled mb-0">{{ $t('DevicesDialog.ClickRefresh') }}</p>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBase } from '@/composables/useBase'
import type { RPCResult } from '@/types/moonraker'
import type { UsbDevice } from '@/types/moonraker/MachineRPC'

const { apiUrl } = useBase()

const props = defineProps({
    hideSystemEntries: { type: Boolean, default: false },
})

const devices = ref<UsbDevice[]>([])
const loading = ref(false)
const loaded = ref(false)

const filteredDevices = computed(() => {
    if (!props.hideSystemEntries) return devices.value

    return devices.value.filter((device) => device.class !== 'Hub')
})

async function refresh() {
    loading.value = true

    devices.value = await fetch(apiUrl.value + '/machine/peripherals/usb')
        .then((res) => res.json())
        .then((res: { result?: RPCResult<'machine.peripherals.usb'> }) => res.result?.usb_devices ?? [])

    loading.value = false
    loaded.value = true
}
</script>

<style scoped></style>
