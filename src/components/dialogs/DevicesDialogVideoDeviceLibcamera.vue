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
                    <textfield-with-copy :label="$t('DevicesDialog.LibcameraId')" :value="device.libcamera_id" />
                </v-col>
            </v-row>
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
                    <v-col class="py-2" cols="4">{{ mode.format }}</v-col>
                    <v-col class="py-2">{{ mode.resolutions.join(', ') }}</v-col>
                </v-row>
            </template>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { LibcameraDevice } from '@/components/dialogs/DevicesDialogVideo.vue'
import { sortResolutions } from '@/plugins/helpers'
import TextfieldWithCopy from '@/components/inputs/TextfieldWithCopy.vue'

@Component({
    components: { TextfieldWithCopy },
})
export default class DevicesDialogVideoDeviceLibcamera extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) device!: LibcameraDevice

    get identicalResolutions() {
        const resolutions = this.device.modes.map((mode) => mode.resolutions.sort(sortResolutions).join(','))
        return resolutions.every((resolution) => resolution === resolutions[0])
    }

    get resolutions() {
        return this.device.modes[0].resolutions.join(', ')
    }

    get formats() {
        return this.device.modes.map((mode) => mode.format).join(', ')
    }
}
</script>
