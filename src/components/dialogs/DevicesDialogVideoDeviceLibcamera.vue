<template>
    <v-card outlined class="mt-3 w-100">
        <v-list-item three-line>
            <v-list-item-content>
                <div class="text-overline mb-2 d-flex flex-row">Libcamera</div>
                <v-list-item-title class="text-h5 mb-0">{{ device.model }}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-card-text>
            <v-row class="mb-1">
                <v-col>
                    <v-text-field
                        readonly
                        dense
                        outlined
                        hide-details
                        :append-icon="mdiContentCopy"
                        :label="$t('DevicesDialog.LibcameraId')"
                        :value="device.libcamera_id"
                        @click:append="copy(device.libcamera_id)" />
                </v-col>
            </v-row>
            <v-row v-for="mode in device.modes" :key="mode.format" class="mt-0">
                <v-col class="py-2" cols="4">{{ mode.format }}</v-col>
                <v-col class="py-2">{{ mode.resolutions.join(', ') }}</v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiContentCopy } from '@mdi/js'
import { LibcameraDevice } from '@/components/dialogs/DevicesDialogVideo.vue'

@Component
export default class DevicesDialogVideoDeviceLibcamera extends Mixins(BaseMixin) {
    mdiContentCopy = mdiContentCopy

    @Prop({ type: Object, required: true }) device!: LibcameraDevice

    copy(text: string) {
        navigator.clipboard.writeText(text)
    }
}
</script>
