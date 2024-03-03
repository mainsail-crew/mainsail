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

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

export interface SerialDevice {
    device_type: 'hardware_uart' | 'usb'
    device_path: string
    device_name: string
    driver_name: string
    path_by_hardware?: string
    path_by_id?: string
    usb_location?: string
}

@Component
export default class DevicesDialogSerial extends Mixins(BaseMixin) {
    devices: SerialDevice[] = []
    loading = false
    loaded = false

    @Prop({ type: Boolean, default: false }) hideSystemEntries!: boolean

    get filteredDevices() {
        if (!this.hideSystemEntries) return this.devices

        return this.devices.filter((device) => device.device_type !== 'hardware_uart')
    }

    async refresh() {
        this.loading = true

        this.devices = await fetch(this.apiUrl + '/machine/peripherals/serial')
            .then((res) => res.json())
            .then((res) => res.result?.serial_devices ?? [])

        this.loading = false
        this.loaded = true
    }
}
</script>

<style scoped></style>
