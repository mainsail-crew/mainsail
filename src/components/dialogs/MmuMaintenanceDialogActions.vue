<template>
    <div>
        <settings-row :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.MotorSync')" dense>
            <v-row dense>
                <v-col class="col-6">
                    <v-btn
                        block
                        small
                        :disabled="!canSend || mmuSyncDrive"
                        color="secondary"
                        @click="doSend('MMU_SYNC_GEAR_MOTOR SYNC=1')">
                        <v-icon left>{{ mdiSync }}</v-icon>
                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Sync') }}
                    </v-btn>
                </v-col>
                <v-col class="col-6">
                    <v-btn
                        block
                        small
                        :disabled="!canSend || !mmuSyncDrive"
                        color="secondary"
                        @click="doSend('MMU_SYNC_GEAR_MOTOR SYNC=0')">
                        <v-icon left>{{ mdiSyncOff }}</v-icon>
                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Unsync') }}
                    </v-btn>
                </v-col>
            </v-row>
        </settings-row>
        <settings-row :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.ExtruderOnly')" dense>
            <v-row dense>
                <v-col class="col-6">
                    <v-btn
                        block
                        small
                        :disabled="!canSend"
                        color="secondary"
                        @click="doSend('MMU_LOAD EXTRUDER_ONLY=1')">
                        <v-icon left>{{ mdiDownloadOutline }}</v-icon>
                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Load') }}
                    </v-btn>
                </v-col>
                <v-col class="col-6">
                    <v-btn
                        block
                        small
                        :disabled="!canSend"
                        color="secondary"
                        @click="doSend('MMU_UNLOAD EXTRUDER_ONLY=1')">
                        <v-icon left>{{ mdiUploadOutline }}</v-icon>
                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Unload') }}
                    </v-btn>
                </v-col>
            </v-row>
        </settings-row>
        <settings-row :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.MmuMotors')" dense>
            <v-row dense>
                <v-col class="col-6">
                    <v-btn block small :disabled="!canSend" color="secondary" @click="doSend('MMU_MOTORS_ON')">
                        <v-icon left>{{ mdiEngineOutline }}</v-icon>
                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.On') }}
                    </v-btn>
                </v-col>
                <v-col class="col-6">
                    <v-btn block small :disabled="!canSend" color="secondary" @click="doSend('MMU_MOTORS_OFF')">
                        <v-icon left>{{ mdiEngineOffOutline }}</v-icon>
                        {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Off') }}
                    </v-btn>
                </v-col>
            </v-row>
        </settings-row>

        <v-divider class="my-6" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import {
    mdiSync,
    mdiSyncOff,
    mdiDownloadOutline,
    mdiUploadOutline,
    mdiEngineOutline,
    mdiEngineOffOutline,
} from '@mdi/js'

@Component
export default class MmuMaintenanceStateDialogActions extends Mixins(BaseMixin, MmuMixin) {
    mdiSync = mdiSync
    mdiSyncOff = mdiSyncOff
    mdiDownloadOutline = mdiDownloadOutline
    mdiUploadOutline = mdiUploadOutline
    mdiEngineOutline = mdiEngineOutline
    mdiEngineOffOutline = mdiEngineOffOutline
}
</script>
