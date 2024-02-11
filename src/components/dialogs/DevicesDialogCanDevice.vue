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
                    <textfield-with-copy label="UUID" :value="device.uuid" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { CanDevice } from '@/components/dialogs/DevicesDialogCan.vue'
import TextfieldWithCopy from '@/components/inputs/TextfieldWithCopy.vue'

@Component({
    components: { TextfieldWithCopy },
})
export default class DevicesDialogCanDevice extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) device!: CanDevice
}
</script>
