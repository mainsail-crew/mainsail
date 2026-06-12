<template>
    <OverlayScrollbarsComponent style="max-height: 400px; overflow-x: hidden">
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
                    <p class="text-center text-disabled mb-0">{{ $t('DevicesDialog.NoDeviceFound') }}</p>
                </v-col>
            </v-row>
            <v-row v-else class="mt-0">
                <v-col class="col-8 mx-auto">
                    <p class="text-center text-disabled mb-0">{{ $t('DevicesDialog.ClickRefresh') }}</p>
                </v-col>
            </v-row>
            <v-row v-if="devices.length === 0">
                <v-col>
                    <v-alert dense outlined type="info" :icon="mdiInformationVariantCircle">
                        {{ $t('DevicesDialog.CanBusInfo') }}
                        <v-row class="my-0">
                            <v-col class="text-center">
                                <v-btn
                                    href="https://docs.mainsail.xyz/overview/features/query-devices#can-devices"
                                    color="info"
                                    outlined
                                    text
                                    small>
                                    open guide
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-alert>
                </v-col>
            </v-row>
        </v-card-text>
    </OverlayScrollbarsComponent>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBase } from '@/composables/useBase'
import DevicesDialogCanDevice from '@/components/dialogs/DevicesDialogCanDevice.vue'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { mdiInformationVariantCircle } from '@mdi/js'
import type { RPCResult } from '@/types/moonraker'
import type { CanDevice } from '@/types/moonraker/MachineRPC'

const { apiUrl } = useBase()

const props = defineProps({
    name: { type: String, required: true },
    hideSystemEntries: { type: Boolean, default: false },
})

const devices = ref<CanDevice[]>([])
const loading = ref(false)
const loaded = ref(false)

async function refresh() {
    loading.value = true

    devices.value = await fetch(`${apiUrl.value}/machine/peripherals/canbus?interface=${props.name}`)
        .then((res) => res.json())
        .then((res: { result?: RPCResult<'machine.peripherals.canbus'> }) => res.result?.can_uuids ?? [])

    loading.value = false
    loaded.value = true
}
</script>

<style scoped></style>
