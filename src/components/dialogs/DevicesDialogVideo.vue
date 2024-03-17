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

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

export interface V4l2Device {
    device_name: string
    device_path: string
    camera_name: string
    driver_name: string
    alt_name: string | null
    hardware_bus: string
    capabilities: string
    version: string
    path_by_hardware: string | null
    path_by_id: string | null
    usb_location: string | null
    modes: { description: string; format: string; flags: string[]; resolutions: string[] }[]
}

export interface LibcameraDevice {
    libcamera_id: string
    model: string
    modes: { format: string; resolutions: string[] }[]
}

@Component
export default class DevicesDialogVideo extends Mixins(BaseMixin) {
    v4l2Devices: V4l2Device[] = []
    libcameraDevices: LibcameraDevice[] = []
    loading = false
    loaded = false

    @Prop({ type: Boolean, default: false }) hideSystemEntries!: boolean

    get filteredLibcameraDevices() {
        if (this.hideSystemEntries) {
            return this.libcameraDevices.filter((device) => !device.libcamera_id.includes('usb@'))
        }

        return this.libcameraDevices
    }

    get filteredV4l2Devices() {
        return this.v4l2Devices.filter((device) => {
            if (this.hideSystemEntries) {
                if (this.libcameraDevices.length === 0 && device.hardware_bus.endsWith('csi')) return true

                return !device.hardware_bus.startsWith('platform:')
            }

            return true
        })
    }

    async refresh() {
        this.loading = true

        const result = await fetch(this.apiUrl + '/machine/peripherals/video')
            .then((res) => res.json())
            .then((res) => res.result ?? {})

        this.v4l2Devices = result.v4l2_devices ?? []
        this.libcameraDevices = result.libcamera_devices ?? []

        this.loading = false
        this.loaded = true
    }
}
</script>

<style scoped></style>
