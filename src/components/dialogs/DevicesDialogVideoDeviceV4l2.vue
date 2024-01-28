<template>
    <v-card outlined class="mt-3 w-100">
        <v-list-item three-line>
            <v-list-item-content>
                <div class="text-overline mb-2 d-flex flex-row">V4L2</div>
                <v-list-item-title class="text-h5 mb-0">{{ device.camera_name }}</v-list-item-title>
                <v-list-item-subtitle v-if="show_alt_name">{{ device.alt_name }}</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-card-text>
            <v-row>
                <v-col>
                    <v-text-field
                        readonly
                        dense
                        outlined
                        hide-details
                        :append-icon="mdiContentCopy"
                        :label="$t('DevicesDialog.DevicePath')"
                        :value="device.device_path"
                        @click:append="copy(device.device_path)" />
                </v-col>
            </v-row>
            <v-row v-if="device.path_by_id">
                <v-col>
                    <v-text-field
                        readonly
                        dense
                        outlined
                        hide-details
                        :append-icon="mdiContentCopy"
                        :label="$t('DevicesDialog.PathById')"
                        :value="device.path_by_id"
                        @click:append="copy(device.path_by_id)" />
                </v-col>
            </v-row>
            <v-row v-if="device.path_by_hardware">
                <v-col>
                    <v-text-field
                        readonly
                        dense
                        outlined
                        hide-details
                        :append-icon="mdiContentCopy"
                        :label="$t('DevicesDialog.PathByHardware')"
                        :value="device.path_by_hardware"
                        @click:append="copy(device.path_by_hardware)" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiContentCopy } from '@mdi/js'
import { V4l2Device } from '@/components/dialogs/DevicesDialogVideo.vue'

@Component
export default class DevicesDialogVideoDeviceLibcamera extends Mixins(BaseMixin) {
    mdiContentCopy = mdiContentCopy

    @Prop({ type: Object, required: true }) device!: V4l2Device

    get show_alt_name() {
        if (this.device.alt_name === null) return false

        return this.device.alt_name !== this.device.camera_name
    }

    copy(text: string) {
        navigator.clipboard.writeText(text)
    }
}
</script>
