<template>
    <v-card-text>
        <v-row>
            <v-col>
                <v-btn @click="refresh">Refresh</v-btn>
            </v-col>
        </v-row>
        <v-row v-if="devices.length">
            <v-col>
                <v-expansion-panels accordion>
                    <devices-dialog-serial-device
                        v-for="device in filteredDevices"
                        :key="device.path_by_hardware ?? device.device_path"
                        :device="device" />
                </v-expansion-panels>
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

    @Prop({ type: Boolean, default: false }) hideSystemEntries!: boolean

    get filteredDevices() {
        if (!this.hideSystemEntries) return this.devices

        return this.devices.filter((device) => {
            if (device.device_type === 'hardware_uart') return false

            return true
        })
    }

    async refresh() {
        this.devices = await fetch(this.apiUrl + '/machine/peripherals/serial')
            .then((res) => res.json())
            .then((res) => res.result?.serial_devices ?? [])
    }
}
</script>

<style scoped></style>
