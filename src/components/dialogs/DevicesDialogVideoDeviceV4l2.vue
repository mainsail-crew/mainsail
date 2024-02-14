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
                    <textfield-with-copy :label="$t('DevicesDialog.DevicePath')" :value="device.device_path" />
                </v-col>
            </v-row>
            <v-row v-if="device.path_by_id">
                <v-col>
                    <textfield-with-copy :label="$t('DevicesDialog.PathById')" :value="device.path_by_id" />
                </v-col>
            </v-row>
            <v-row v-if="device.path_by_hardware">
                <v-col>
                    <textfield-with-copy :label="$t('DevicesDialog.PathByHardware')" :value="device.path_by_hardware" />
                </v-col>
            </v-row>
            <template v-if="device.modes.length">
                <template v-if="identicalResolutions">
                    <v-row class="mt-0">
                        <v-col class="py-2" cols="4">{{ $t('DevicesDialog.Formats') }}</v-col>
                        <v-col class="py-2">{{ formats }}</v-col>
                    </v-row>
                    <v-row class="mt-0">
                        <v-col class="py-2" cols="4">{{ $t('DevicesDialog.Resolutions') }}</v-col>
                        <v-col class="py-2">{{ resolutions }}</v-col>
                    </v-row>
                </template>
                <template v-else>
                    <v-row v-for="mode in device.modes" :key="mode.format" class="mt-0">
                        <v-col class="py-2" cols="4">
                            {{ mode.description }}
                            <br />
                            <small>{{ mode.format }}</small>
                        </v-col>
                        <v-col class="py-2">{{ mode.resolutions.join(', ') }}</v-col>
                    </v-row>
                </template>
            </template>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { V4l2Device } from '@/components/dialogs/DevicesDialogVideo.vue'
import { sortResolutions } from '@/plugins/helpers'
import TextfieldWithCopy from '@/components/inputs/TextfieldWithCopy.vue'

@Component({
    components: { TextfieldWithCopy },
})
export default class DevicesDialogVideoDeviceV4l2 extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) device!: V4l2Device

    get identicalResolutions() {
        const resolutions = this.device.modes.map((mode) => mode.resolutions.sort(sortResolutions).join(','))
        return resolutions.every((resolution) => resolution === resolutions[0])
    }

    get resolutions() {
        return this.device.modes[0]?.resolutions?.join(', ') ?? ''
    }

    get formats() {
        return this.device.modes.map((mode) => `${mode.description} (${mode.format})`).join(', ')
    }

    get show_alt_name() {
        if (this.device.alt_name === null) return false

        return this.device.alt_name !== this.device.camera_name
    }
}
</script>
