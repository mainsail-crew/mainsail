<template>
    <overlay-scrollbars style="max-height: 400px; overflow-x: hidden">
        <v-card-text>
            <v-row>
                <v-col class="text-center">
                    <v-btn :loading="loading" color="primary" @click="refresh">{{ $t('DevicesDialog.Refresh') }}</v-btn>
                </v-col>
            </v-row>
            <v-row v-if="devices.length" class="mt-0">
                <v-col>
                    <devices-dialog-usb-device
                        v-for="device in filteredDevices"
                        :key="device.usb_location"
                        :device="device" />
                </v-col>
            </v-row>
        </v-card-text>
    </overlay-scrollbars>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

export interface UsbDevice {
    bus_num: number
    device_num: number
    usb_location: string
    vendor_id: string
    product_id: string
    manufacturer?: string
    product?: string
    class?: string
    subclass?: string
    protocol?: string
    description?: string
}

@Component
export default class DevicesDialogUsb extends Mixins(BaseMixin) {
    devices: UsbDevice[] = []
    loading = false

    @Prop({ type: Boolean, default: false }) hideSystemEntries!: boolean

    get filteredDevices() {
        if (!this.hideSystemEntries) return this.devices

        return this.devices.filter((device) => {
            if (device.class === 'Hub') return false

            return true
        })
    }

    async refresh() {
        this.loading = true

        this.devices = await fetch(this.apiUrl + '/machine/peripherals/usb')
            .then((res) => res.json())
            .then((res) => res.result?.usb_devices ?? [])

        window.console.log(this.devices)

        this.loading = false
    }
}
</script>

<style scoped></style>
