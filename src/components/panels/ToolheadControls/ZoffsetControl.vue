<style>
.v-btn-toggle {
    width: 100%;
}
</style>

<template>
    <v-container>
        <v-row>
            <v-col class="v-subheader text--secondary">
                <v-icon small class="mr-2">
                    {{ mdiArrowCollapseVertical }}
                </v-icon>
                <span>{{ $t('Panels.ZoffsetPanel.Headline') }}</span>
            </v-col>
            <v-col class="v-subheader justify-end">
                <div class="d-flex align-center">
                    <v-btn
                        v-if="z_gcode_offset !== 0"
                        :loading="loadings.includes('babySteppingClear')"
                        text
                        small
                        plain
                        class="px-2 mr-1"
                        @click="clearZOffset()">
                        <v-icon small>{{ mdiBroom }}</v-icon>
                        <span class="ml-1">{{ $t('Panels.ZoffsetPanel.Clear') }}</span>
                    </v-btn>
                    <v-btn
                        v-if="
                            z_gcode_offset !== 0 &&
                            ((existZOffsetApplyProbe && !existZOffsetApplyEndstop) ||
                                (!existZOffsetApplyProbe && existZOffsetApplyEndstop))
                        "
                        color="primary"
                        text
                        small
                        plain
                        class="pl-2 pr-0"
                        @click="saveZOffset">
                        <v-icon small>{{ mdiContentSave }}</v-icon>
                        <span class="ml-1">{{ $t('Panels.ZoffsetPanel.Save') }}</span>
                    </v-btn>
                    <v-menu v-else-if="z_gcode_offset !== 0" offset-y left :close-on-content-click="false">
                        <template #activator="{ on, attrs }">
                            <v-btn plain text small color="primary" v-bind="attrs" class="pl-2 pr-0" v-on="on">
                                <v-icon small>{{ mdiContentSave }}</v-icon>
                                <span class="ml-1">{{ $t('Panels.ZoffsetPanel.Save') }}</span>
                                <v-icon small>{{ mdiMenuDown }}</v-icon>
                            </v-btn>
                        </template>
                        <v-list dense>
                            <v-list-item>
                                <v-btn small style="width: 100%" @click="saveZOffsetToEndstop">
                                    <v-icon left small>{{ mdiElectricSwitch }}</v-icon>
                                    {{ $t('Panels.ZoffsetPanel.ToEndstop') }}
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small style="width: 100%" @click="saveZOffsetToProbe">
                                    <v-icon left small>{{ mdiElevator }}</v-icon>
                                    {{ $t('Panels.ZoffsetPanel.ToProbe') }}
                                </v-btn>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col>
                <v-btn-toggle dense no-gutters>
                    <v-btn
                        v-for="(offset, index) in offsetsZ"
                        :key="`offsetsUp-${index}`"
                        small
                        class="flex-grow-1"
                        @click="sendBabyStepUp(offset)">
                        <v-icon v-if="index === 0" small class="mr-2">
                            {{ mdiArrowExpandUp }}
                        </v-icon>
                        +{{ offset }}
                    </v-btn>
                </v-btn-toggle>
            </v-col>
            <v-col>
                <v-btn-toggle dense no-gutters>
                    <v-btn
                        v-for="(offset, index) in offsetsZ"
                        :key="`offsetsDown-${index}`"
                        small
                        class="flex-grow-1"
                        @click="sendBabyStepDown(offset)">
                        <v-icon v-if="index === 0" small class="mr-2">{{ mdiArrowCollapseDown }}</v-icon>
                        -{{ offset }}
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>

        <v-dialog v-model="saveOffsetDialog" max-width="290">
            <panel
                :title="$t('Panels.ZoffsetPanel.SaveInfoHeadline').toString()"
                :icon="mdiInformation"
                card-class="zoffset-saveinfo-dialog"
                :margin-bottom="false">
                <v-card-text v-if="printerIsPrinting" class="mt-3">
                    {{ $t('Panels.ZoffsetPanel.SaveInfoDescriptionPrint') }}
                </v-card-text>
                <v-card-text v-else class="mt-3">{{ $t('Panels.ZoffsetPanel.SaveInfoDescription') }}</v-card-text>
                <v-card-actions v-if="printerIsPrinting">
                    <v-spacer></v-spacer>
                    <v-btn text @click="saveOffsetDialog = false">{{ $t('Panels.ZoffsetPanel.Ok') }}</v-btn>
                </v-card-actions>
                <v-card-actions v-else>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="saveConfig">{{ $t('Panels.ZoffsetPanel.SaveConfig') }}</v-btn>
                    <v-btn text @click="saveOffsetDialog = false">{{ $t('Panels.ZoffsetPanel.Later') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { CommandHelp } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiBroom,
    mdiElectricSwitch,
    mdiElevator,
    mdiContentSave,
    mdiArrowCollapseDown,
    mdiArrowCollapseVertical,
    mdiArrowExpandUp,
    mdiInformation,
    mdiMenuDown,
} from '@mdi/js'
@Component({
    components: { Panel },
})
export default class ZoffsetControl extends Mixins(BaseMixin) {
    mdiBroom = mdiBroom
    mdiElectricSwitch = mdiElectricSwitch
    mdiElevator = mdiElevator
    mdiContentSave = mdiContentSave
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiArrowCollapseVertical = mdiArrowCollapseVertical
    mdiArrowExpandUp = mdiArrowExpandUp
    mdiInformation = mdiInformation
    mdiMenuDown = mdiMenuDown

    private saveOffsetDialog = false

    get displayZOffsetStandby() {
        return this.$store.state.gui.uiSettings.displayZOffsetStandby ?? false
    }

    get homing_origin() {
        return this.$store.state.printer?.gcode_move?.homing_origin ?? []
    }

    get z_gcode_offset() {
        return this.homing_origin.length > 1 ? Math.round(this.homing_origin[2] * 1000) / 1000 : 0
    }

    get offsetsZ() {
        return this.$store.state.gui.control.offsetsZ
    }

    get homed_axis() {
        return this.$store.state.printer.toolhead.homed_axes ?? ''
    }

    get helplist() {
        return this.$store.state.printer.helplist ?? []
    }

    get existZOffsetApplyProbe() {
        return this.helplist.findIndex((gcode: CommandHelp) => gcode.commandLow === 'z_offset_apply_probe') !== -1
    }

    get existZOffsetApplyEndstop() {
        return this.helplist.findIndex((gcode: CommandHelp) => gcode.commandLow === 'z_offset_apply_endstop') !== -1
    }

    sendBabyStepDown(offset: number): void {
        const gcode = `SET_GCODE_OFFSET Z_ADJUST=-${offset} ${this.homed_axis === 'xyz' ? 'MOVE=1' : ''}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'babyStepDown' })
    }

    sendBabyStepUp(offset: number): void {
        const gcode = `SET_GCODE_OFFSET Z_ADJUST=+${offset} ${this.homed_axis === 'xyz' ? 'MOVE=1' : ''}`
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'babyStepUp' })
    }

    clearZOffset(): void {
        const gcode = 'SET_GCODE_OFFSET Z=0' + (this.homed_axis === 'xyz' ? ' MOVE=1' : '')
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'babySteppingClear' })
    }

    saveZOffset(): void {
        if (this.existZOffsetApplyProbe && !this.existZOffsetApplyEndstop) {
            this.saveZOffsetToProbe()
        }
        if (!this.existZOffsetApplyProbe && this.existZOffsetApplyEndstop) {
            this.saveZOffsetToEndstop()
        }
    }

    saveZOffsetToEndstop(): void {
        const gcode = 'Z_OFFSET_APPLY_ENDSTOP'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
        this.saveOffsetDialog = true
    }

    saveZOffsetToProbe(): void {
        const gcode = 'Z_OFFSET_APPLY_PROBE'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
        this.saveOffsetDialog = true
    }

    saveConfig(): void {
        const gcode = 'SAVE_CONFIG'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'topbarSaveConfig' })
        this.saveOffsetDialog = false
    }
}
</script>
