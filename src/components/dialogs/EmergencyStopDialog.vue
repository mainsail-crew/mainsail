<template>
    <v-dialog :value="showDialog" width="400" persistent>
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
                <v-btn text @click="closePrompt">{{ $t('EmergencyStopDialog.No') }}</v-btn>
                <v-btn color="primary" text @click="emergencyStop">{{ $t('EmergencyStopDialog.Yes') }}</v-btn>
            </v-card-actions>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'

import { mdiAlertOctagonOutline, mdiCloseThick } from '@mdi/js'

@Component({
    components: { Panel },
})
export default class EmergencyStopDialog extends Mixins(BaseMixin) {
    mdiAlertOctagonOutline = mdiAlertOctagonOutline
    mdiCloseThick = mdiCloseThick

    @Prop({ type: Boolean, default: false }) showDialog!: boolean

    emergencyStop() {
        this.$socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' })

        this.closePrompt()
    }

    closePrompt() {
        this.$emit('close')
    }
}
</script>

<style scoped></style>
