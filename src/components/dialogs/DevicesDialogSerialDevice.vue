<template>
    <v-card outlined class="mt-3 w-100">
        <v-list-item three-line>
            <v-list-item-content>
                <div class="text-overline mb-2 d-flex flex-row">
                    <span>{{ device.device_type.toUpperCase().replaceAll('_', ' ') }}</span>
                    <v-spacer />
                    <span>{{ device.driver_name }}</span>
                </div>
                <v-list-item-title class="text-h5 mb-0">{{ device.device_name }}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-card-text>
            <v-row>
                <v-col>
                    <textfield-with-copy :label="$t('DevicesDialog.DevicePath')" :value="device.device_path" />
                </v-col>
            </v-row>
            <v-row v-if="device.path_by_id ?? false">
                <v-col>
                    <textfield-with-copy :label="$t('DevicesDialog.PathById')" :value="device.path_by_id" />
                </v-col>
            </v-row>
            <v-row v-if="device.path_by_hardware ?? false">
                <v-col>
                    <textfield-with-copy :label="$t('DevicesDialog.PathByHardware')" :value="device.path_by_hardware" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { SerialDevice } from '@/components/dialogs/DevicesDialogSerial.vue'
import TextfieldWithCopy from '@/components/inputs/TextfieldWithCopy.vue'

@Component({
    components: { TextfieldWithCopy },
})
export default class DevicesDialogSerialDevice extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) device!: SerialDevice
}
</script>
