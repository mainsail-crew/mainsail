<template>
    <v-dialog v-model="showDialog" persistent max-width="600">
        <panel
            :title="$t('Machine.UpdatePanel.AreYouSure')"
            :icon="mdiProgressQuestion"
            :margin-bottom="false"
            card-class="machine-firmware-update-hint-dialog">
            <template #buttons>
                <v-btn icon tile @click="closeDialog">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-alert text dense type="warning" border="left">
                            {{ $t('Machine.FirmwarePanel.UpdateHintText', { mcus: mcus.join(', ') }) }}
                        </v-alert>
                        <v-checkbox
                            v-model="checkboxUpdateQuestion"
                            :label="$t('Machine.UpdatePanel.IUnderstandTheRisks')"
                            hide-details />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Machine.UpdatePanel.Abort') }}</v-btn>
                <v-btn text color="primary" :disabled="!checkboxUpdateQuestion" @click="startUpdate">
                    {{ $t('Machine.UpdatePanel.StartUpdate') }}
                </v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiCloseThick, mdiProgressQuestion } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class FirmwareUpdateHint extends Mixins(BaseMixin) {
    mdiCloseThick = mdiCloseThick
    mdiProgressQuestion = mdiProgressQuestion

    checkboxUpdateQuestion = false

    @VModel({ type: Boolean }) showDialog!: boolean
    @Prop({ type: Array, required: true }) readonly mcus!: string[]

    // Closes before emitting so the hint never sits over the progress dialog or submits twice.
    startUpdate() {
        this.closeDialog()
        this.$emit('do-update')
    }

    closeDialog() {
        this.checkboxUpdateQuestion = false
        this.showDialog = false
    }
}
</script>
