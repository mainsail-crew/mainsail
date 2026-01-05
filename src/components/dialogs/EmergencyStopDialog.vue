<template>
    <v-dialog v-model="showDialog" width="400" persistent>
        <panel
            :title="$t('EmergencyStopDialog.EmergencyStop')"
            toolbar-color="error"
            card-class="emergency-stop-dialog"
            :icon="mdiAlertOctagonOutline"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="closePrompt">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>{{ $t('EmergencyStopDialog.AreYouSure') }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closePrompt">{{ $t('Buttons.No') }}</v-btn>
                <v-btn color="error" text @click="emergencyStop">{{ $t('Buttons.Yes') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiAlertOctagonOutline, mdiCloseThick } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class EmergencyStopDialog extends Mixins(BaseMixin) {
    mdiAlertOctagonOutline = mdiAlertOctagonOutline
    mdiCloseThick = mdiCloseThick

    @VModel({ type: Boolean }) showDialog!: boolean

    emergencyStop() {
        this.$socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' })

        this.closePrompt()
    }

    closePrompt() {
        this.showDialog = false
    }
}
</script>

<style scoped></style>
