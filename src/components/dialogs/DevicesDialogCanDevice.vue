<template>
    <v-card outlined class="mt-3 w-100">
        <v-card-text>
            <v-row>
                <v-col>
                    <div class="text-overline mb-2 d-flex flex-row">
                        <span>{{ device.application }}</span>
                    </div>
                </v-col>
            </v-row>
            <v-row class="mt-0">
                <v-col>
                    <v-text-field
                        readonly
                        dense
                        outlined
                        hide-details
                        :append-icon="mdiContentCopy"
                        label="UUID"
                        :value="device.uuid"
                        @click:append="copy(device.uuid)" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiContentCopy } from '@mdi/js'
import { copyToClipboard } from '@/plugins/helpers'
import { CanDevice } from '@/components/dialogs/DevicesDialogCan.vue'

@Component
export default class DevicesDialogCanDevice extends Mixins(BaseMixin) {
    mdiContentCopy = mdiContentCopy

    @Prop({ type: Object, required: true }) device!: CanDevice

    copy(text: string) {
        copyToClipboard(text)
    }
}
</script>
