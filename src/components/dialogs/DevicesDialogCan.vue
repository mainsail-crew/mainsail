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
                    <devices-dialog-can-device v-for="device in devices" :key="device.uuid" :device="device" />
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
    </overlay-scrollbars>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import DevicesDialogCanDevice from '@/components/dialogs/DevicesDialogCanDevice.vue'

export interface CanDevice {
    application: string
    uuid: string
}

@Component({
    components: { DevicesDialogCanDevice },
})
export default class DevicesDialogCan extends Mixins(BaseMixin) {
    devices: CanDevice[] = []
    loading = false
    loaded = false

    @Prop({ type: String, required: true }) name!: string
    @Prop({ type: Boolean, default: false }) hideSystemEntries!: boolean

    async refresh() {
        this.loading = true

        this.devices = await fetch(`${this.apiUrl}/machine/peripherals/canbus?interface=${this.name}`)
            .then((res) => res.json())
            .then((res) => res.result.can_uuids ?? [])

        this.loading = false
        this.loaded = true
    }
}
</script>

<style scoped></style>
