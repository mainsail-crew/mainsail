<template>
    <v-card outlined class="mt-3">
        <v-list-item three-line>
            <v-list-item-content>
                <div class="text-overline mb-2 d-flex flex-row">
                    <span>{{ device.manufacturer ?? 'Unknown' }}</span>
                    <v-spacer />
                    <span>{{ device.vendor_id }}:{{ device.product_id }}</span>
                </div>
                <v-list-item-title class="text-h5 mb-1">{{ device.product ?? 'Unknown' }}</v-list-item-title>
                <v-list-item-subtitle v-if="device.description">{{ device.description }}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-card-text class="pt-0">
            <v-row v-for="item in details" :key="item.key" class="mt-0">
                <v-col class="py-2" cols="3">{{ item.key }}</v-col>
                <v-col class="py-2">{{ item.value }}</v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { UsbDevice } from '@/components/dialogs/DevicesDialogUsb.vue'

@Component
export default class DevicesDialogUsbDevice extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) device!: UsbDevice

    get details() {
        const types = ['protocol', 'class', 'serial', 'usb_location']
        const output: { key: string; value: string }[] = []

        Object.keys(this.device).forEach((key) => {
            // @ts-ignore
            let value = this.device[key] ?? null

            if (!types.includes(key) || value === null) return

            if (key === 'class' && this.device['subclass']) {
                value += `, ${this.device['subclass']}`
            }

            output.push({
                key,
                value,
            })
        })

        return output
    }
}
</script>
