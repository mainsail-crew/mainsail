<template>
    <v-card-text>
        <v-row>
            <v-col class="text-center">
 <v-btn :loading="loading" color="primary" @click="refresh">{{ $t('DevicesDialog.Refresh') }}</v-btn>
            </v-col>
        </v-row>
        <v-row v-if="libcameraDevices.length || filteredV4l2Devices.length" class="mt-0">
            <v-col>
                <devices-dialog-video-device-libcamera
                    v-for="(device, index) in filteredLibcameraDevices"
                    :key="`libcamera_${device.libcamera_id}_${index}`"
                    :device="device" />
                <devices-dialog-video-device-v4l2
                    v-for="(device, index) in filteredV4l2Devices"
                    :key="`v4l2_${device.hardware_bus}_${index}`"
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
import type { LibcameraDevice, V4l2Device } from '@/types/moonraker/MachineRPC'

const { apiUrl } = useBase()

const props = defineProps({
    hideSystemEntries: { type: Boolean, default: false },
})

const v4l2Devices = ref<V4l2Device[]>([])
const libcameraDevices = ref<LibcameraDevice[]>([])
const loading = ref(false)
const loaded = ref(false)

const filteredLibcameraDevices = computed(() => {
    if (props.hideSystemEntries) {
        return libcameraDevices.value.filter((device) => !device.libcamera_id.includes('usb@'))
    }

    return libcameraDevices.value
})

const filteredV4l2Devices = computed(() => {
    return v4l2Devices.value.filter((device) => {
        if (props.hideSystemEntries) {
            if (libcameraDevices.value.length === 0 && device.hardware_bus.endsWith('csi')) return true

            return !device.hardware_bus.startsWith('platform:')
        }

        return true
    })
})

async function refresh() {
    loading.value = true

    const result = await fetch(apiUrl.value + '/machine/peripherals/video')
        .then((res) => res.json())
        .then((res: { result?: RPCResult<'machine.peripherals.video'> }) => res.result)

    v4l2Devices.value = result?.v4l2_devices ?? []
    libcameraDevices.value = result?.libcamera_devices ?? []

    loading.value = false
    loaded.value = true
}
</script>

<style scoped></style>
