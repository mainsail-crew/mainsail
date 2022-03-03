<style></style>

<template>
    <div>
        <panel
            v-if="displayPanel"
            :icon="mdiArrowCollapseVertical"
            :title="$t('Panels.ZoffsetPanel.Headline')"
            :collapsible="true"
            card-class="zoffset-panel">
            <template #buttons>
                <template v-if="z_gcode_offset !== 0">
                    <v-btn icon tile :loading="loadings.includes('babySteppingClear')" @click="clearZOffset()">
                        <v-icon>{{ mdiBroom }}</v-icon>
                    </v-btn>
                    <v-menu v-if="existZOffsetApplyProbe && existZOffsetApplyEndstop" offset-y left>
                        <template #activator="{ on, attrs }">
                            <v-btn text tile color="primary" v-bind="attrs" class="pa-1" v-on="on">
                                <span class="ml-1">{{ $t('Panels.ZoffsetPanel.Save') }}</span>
                                <v-icon>{{ mdiMenuDown }}</v-icon>
                            </v-btn>
                        </template>
                        <v-list dense class="py-0">
                            <v-list-item link @click="saveZOffsetToEndstop">
                                <v-list-item-icon class="mr-0">
                                    <v-icon small>{{ mdiElectricSwitch }}</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>{{ $t('Panels.ZoffsetPanel.ToEndstop') }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item link @click="saveZOffsetToProbe">
                                <v-list-item-icon class="mr-0">
                                    <v-icon small>{{ mdiElevator }}</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>{{ $t('Panels.ZoffsetPanel.ToProbe') }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-btn
                        v-else-if="existZOffsetApplyProbe && !existZOffsetApplyEndstop"
                        text
                        tile
                        class="px-2 minwidth-0"
                        color="primary ml-3"
                        @click="saveZOffsetToProbe">
                        <v-icon small class="mr-1">{{ mdiContentSave }}</v-icon>
                        {{ $t('Panels.ZoffsetPanel.Save') }}
                    </v-btn>
                    <v-btn
                        v-else-if="!existZOffsetApplyProbe && existZOffsetApplyEndstop"
                        text
                        tile
                        class="px-2 minwidth-0"
                        color="primary ml-3"
                        @click="saveZOffsetToEndstop">
                        <v-icon small class="mr-1">{{ mdiContentSave }}</v-icon>
                        {{ $t('Panels.ZoffsetPanel.Save') }}
                    </v-btn>
                </template>
            </template>
            <v-card-text class="px-0 py-0">
                <v-container>
                    <v-row class="py-0">
                        <v-col class="pb-0 text-center">
                            <p class="mb-0">
                                {{ $t('Panels.ZoffsetPanel.CurrentOffset') }}: {{ z_gcode_offset.toFixed(3) }}mm
                            </p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="col text-center d-flex flex-column align-center flex-sm-row justify-center">
                            <v-btn-toggle
                                dense
                                no-gutters
                                class="mx-2 mt-3 mt-sm-0 order-last flex-nowrap order-sm-first">
                                <v-btn
                                    small
                                    class=""
                                    :loading="loadings.includes('babySteppingDownFine')"
                                    @click="sendBabySteppingDownFine()">
                                    <v-icon small class="mr-2">{{ mdiArrowCollapseDown }}</v-icon>
                                    -0.01
                                    <span class="d-sm-none d-md-inline">mm</span>
                                </v-btn>
                                <v-btn
                                    small
                                    class=""
                                    :loading="loadings.includes('babySteppingDown')"
                                    @click="sendBabySteppingDown()">
                                    -0.05
                                    <span class="d-sm-none d-md-inline">mm</span>
                                </v-btn>
                            </v-btn-toggle>
                            <v-btn-toggle dense no-gutters class="mx-2 order-first flex-nowrap order-sm-last">
                                <v-btn
                                    small
                                    class=""
                                    :loading="loadings.includes('babySteppingUpFine')"
                                    @click="sendBabySteppingUpFine()">
                                    <v-icon small class="mr-2">{{ mdiArrowExpandUp }}</v-icon>
                                    +0.01
                                    <span class="d-sm-none d-md-inline">mm</span>
                                </v-btn>
                                <v-btn
                                    small
                                    class=""
                                    :loading="loadings.includes('babySteppingUp')"
                                    @click="sendBabySteppingUp()">
                                    +0.05
                                    <span class="d-sm-none d-md-inline">mm</span>
                                </v-btn>
                            </v-btn-toggle>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </panel>
        <v-dialog v-model="saveOffsetDialog" max-width="290">
            <panel
                :title="$t('Panels.ZoffsetPanel.SaveInfoHeadline')"
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
                    <v-btn color="primary" text @click="saveConfig">{{ $t('Panels.ZoffsetPanel.SAVE_CONFIG') }}</v-btn>
                    <v-btn text @click="saveOffsetDialog = false">{{ $t('Panels.ZoffsetPanel.Later') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import { CommandHelp } from '@/store/printer/types'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiBroom,
    mdiMenuDown,
    mdiElectricSwitch,
    mdiElevator,
    mdiContentSave,
    mdiArrowCollapseVertical,
    mdiArrowCollapseDown,
    mdiArrowExpandUp,
    mdiInformation,
} from '@mdi/js'
@Component({
    components: { Panel },
})
export default class ZoffsetPanel extends Mixins(BaseMixin) {
    mdiBroom = mdiBroom
    mdiMenuDown = mdiMenuDown
    mdiElectricSwitch = mdiElectricSwitch
    mdiElevator = mdiElevator
    mdiContentSave = mdiContentSave
    mdiArrowCollapseVertical = mdiArrowCollapseVertical
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiArrowExpandUp = mdiArrowExpandUp
    mdiInformation = mdiInformation

    private saveOffsetDialog = false

    get displayPanel() {
        if (!this.klippyIsConnected) return false

        if (this.displayZOffsetStandby) return this.klipperReadyForGui
        else if (this.klipperReadyForGui && this.z_gcode_offset !== 0) return true
        else if (['printing', 'paused'].includes(this.printer_state)) return true

        return false
    }

    get displayZOffsetStandby() {
        return this.$store.state.gui.uiSettings.displayZOffsetStandby ?? false
    }

    get homing_origin() {
        return this.$store.state.printer?.gcode_move?.homing_origin ?? []
    }

    get z_gcode_offset() {
        return this.homing_origin.length > 1 ? Math.round(this.homing_origin[2] * 1000) / 1000 : 0
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

    sendBabySteppingDownFine() {
        const gcode = 'SET_GCODE_OFFSET Z_ADJUST=-0.01' + (this.homed_axis === 'xyz' ? ' MOVE=1' : '')
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'babySteppingDownFine' })
    }

    sendBabySteppingDown() {
        const gcode = 'SET_GCODE_OFFSET Z_ADJUST=-0.05' + (this.homed_axis === 'xyz' ? ' MOVE=1' : '')
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'babySteppingDown' })
    }

    sendBabySteppingUpFine() {
        const gcode = 'SET_GCODE_OFFSET Z_ADJUST=0.01' + (this.homed_axis === 'xyz' ? ' MOVE=1' : '')
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'babySteppingUpFine' })
    }

    sendBabySteppingUp() {
        const gcode = 'SET_GCODE_OFFSET Z_ADJUST=0.05' + (this.homed_axis === 'xyz' ? ' MOVE=1' : '')
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'babySteppingUp' })
    }

    clearZOffset() {
        const gcode = 'SET_GCODE_OFFSET Z=0' + (this.homed_axis === 'xyz' ? ' MOVE=1' : '')
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'babySteppingClear' })
    }

    saveZOffsetToEndstop() {
        const gcode = 'Z_OFFSET_APPLY_ENDSTOP'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
        this.saveOffsetDialog = true
    }

    saveZOffsetToProbe() {
        const gcode = 'Z_OFFSET_APPLY_PROBE'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
        this.saveOffsetDialog = true
    }

    saveConfig() {
        const gcode = 'SAVE_CONFIG'
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode }, { loading: 'topbarSaveConfig' })
        this.saveOffsetDialog = false
    }
}
</script>
