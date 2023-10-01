<template>
    <responsive
        :breakpoints="{
            xsmall: (el) => el.width <= 285,
            medium: (el) => el.width <= 510,
        }">
        <template #default="{ el }">
            <v-container class="pa-0">
                <v-row>
                    <v-col class="v-subheader text--secondary pr-0">
                        <v-icon small class="mr-2">
                            {{ mdiLayersOutline }}
                        </v-icon>
                        <span>{{ $t('Panels.ZoffsetPanel.Headline') }}: {{ zOffset }}</span>
                    </v-col>
                    <v-col class="v-subheader justify-end pl-0">
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
                                <span v-if="!el.is.xsmall" class="ml-1">{{ $t('Panels.ZoffsetPanel.Clear') }}</span>
                            </v-btn>
                            <v-btn
                                v-if="showSaveButton"
                                color="primary"
                                text
                                small
                                plain
                                class="px-2"
                                @click="saveZOffset">
                                <v-icon small>{{ mdiContentSave }}</v-icon>
                                <span v-if="!el.is.xsmall" class="ml-1">{{ $t('Panels.ZoffsetPanel.Save') }}</span>
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col :class="!el.is.medium ? 'order-1 col-6' : 'col-12'">
                        <div class="d-flex align-center">
                            <v-item-group class="_btn-group">
                                <v-btn
                                    v-for="(offset, index) in offsetsZ"
                                    :key="`offsetsUp-${index}`"
                                    small
                                    class="_btn-qs flex-grow-1 px-1"
                                    @click="sendBabyStepUp(offset)">
                                    <v-icon v-if="index === 0 && !el.is.xsmall" left small class="mr-1 ml-n1">
                                        {{ mdiArrowExpandUp }}
                                    </v-icon>
                                    <span>&plus;{{ offset }}</span>
                                </v-btn>
                            </v-item-group>
                        </div>
                    </v-col>
                    <v-col :class="!el.is.medium ? 'order-0 col-6' : 'col-12'">
                        <v-item-group v-if="!el.is.medium" class="_btn-group">
                            <v-btn
                                v-for="(offset, index) in offsetsZ.slice().reverse()"
                                :key="`offsetsDown-${index}`"
                                small
                                class="_btn-qs flex-grow-1 px-1"
                                @click="sendBabyStepDown(offset)">
                                <span>&minus;{{ offset }}</span>
                                <v-icon
                                    v-if="index === offsetsZ.length - 1 && !el.is.xsmall"
                                    left
                                    small
                                    class="mr-n1 ml-1">
                                    {{ mdiArrowCollapseDown }}
                                </v-icon>
                            </v-btn>
                        </v-item-group>
                        <v-item-group v-else class="_btn-group">
                            <v-btn
                                v-for="(offset, index) in offsetsZ"
                                :key="`offsetsDown-${index}`"
                                small
                                class="_btn-qs flex-grow-1 px-1"
                                @click="sendBabyStepDown(offset)">
                                <v-icon v-if="index === 0 && !el.is.xsmall" left small class="mr-1 ml-n1">
                                    {{ mdiArrowCollapseDown }}
                                </v-icon>
                                <span>&minus;{{ offset }}</span>
                            </v-btn>
                        </v-item-group>
                    </v-col>
                </v-row>

                <v-dialog v-model="saveOffsetDialog" max-width="290">
                    <panel
                        :title="$t('Panels.ZoffsetPanel.SaveInfoHeadline')"
                        :icon="mdiInformation"
                        card-class="zoffset-saveinfo-dialog"
                        :margin-bottom="false">
                        <v-card-text v-if="printerIsPrinting" class="mt-3">
                            {{ $t('Panels.ZoffsetPanel.SaveInfoDescriptionPrint') }}
                        </v-card-text>
                        <v-card-text v-else class="mt-3">
                            {{ $t('Panels.ZoffsetPanel.SaveInfoDescription') }}
                        </v-card-text>
                        <v-card-actions v-if="printerIsPrinting">
                            <v-spacer></v-spacer>
                            <v-btn text @click="saveOffsetDialog = false">{{ $t('Panels.ZoffsetPanel.Ok') }}</v-btn>
                        </v-card-actions>
                        <v-card-actions v-else>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="saveConfig">
                                {{ $t('Panels.ZoffsetPanel.SaveConfig') }}
                            </v-btn>
                            <v-btn text @click="saveOffsetDialog = false">{{ $t('Panels.ZoffsetPanel.Later') }}</v-btn>
                        </v-card-actions>
                    </panel>
                </v-dialog>
            </v-container>
        </template>
    </responsive>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { CommandHelp } from '@/store/printer/types'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import Responsive from '@/components/ui/Responsive.vue'

import {
    mdiBroom,
    mdiContentSave,
    mdiArrowCollapseDown,
    mdiInformation,
    mdiArrowExpandUp,
    mdiLayersOutline,
} from '@mdi/js'
@Component({
    components: { Panel, Responsive },
})
export default class ZoffsetControl extends Mixins(BaseMixin) {
    mdiBroom = mdiBroom
    mdiContentSave = mdiContentSave
    mdiArrowCollapseDown = mdiArrowCollapseDown
    mdiInformation = mdiInformation
    mdiArrowExpandUp = mdiArrowExpandUp
    mdiLayersOutline = mdiLayersOutline

    saveOffsetDialog = false

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
        return this.$store.state.printer.toolhead?.homed_axes ?? ''
    }

    get helplist() {
        return this.$store.state.printer.helplist ?? []
    }

    get settings() {
        return this.$store.state.printer.configfile?.settings ?? {}
    }

    get kinematics() {
        return this.settings.printer?.kinematics ?? 'cartesian'
    }

    get stepper_name() {
        if (this.kinematics === 'delta') return 'stepper_a'

        return 'stepper_z'
    }

    get endstop_pin() {
        const stepperConfig = this.settings[this.stepper_name] ?? {}

        return stepperConfig?.endstop_pin
    }

    get isEndstopProbe() {
        return this.endstop_pin.search('probe:z_virtual_endstop') !== -1
    }

    get existZOffsetApplyProbe() {
        return this.helplist.findIndex((gcode: CommandHelp) => gcode.commandLow === 'z_offset_apply_probe') !== -1
    }

    get existZOffsetApplyEndstop() {
        return this.helplist.findIndex((gcode: CommandHelp) => gcode.commandLow === 'z_offset_apply_endstop') !== -1
    }

    get zOffset(): number {
        return this.$store.state.printer?.gcode_move?.homing_origin[2].toFixed(3)
    }

    get showSaveButton() {
        // hide button when offset is 0
        if (this.z_gcode_offset === 0) return false

        // show button when z endstop is probe and probe gcode exists
        if (this.isEndstopProbe && this.existZOffsetApplyProbe) return true

        // show button when z endstop is endstop and endstop gcode exists
        return !this.isEndstopProbe && this.existZOffsetApplyEndstop
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
        if (this.isEndstopProbe && this.existZOffsetApplyProbe) {
            this.saveZOffsetToProbe()
            return
        }

        this.saveZOffsetToEndstop()
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

<style lang="scss" scoped>
.v-btn-toggle {
    width: 100%;
}

._btn-group {
    border-radius: 4px;
    display: inline-flex;
    flex-wrap: nowrap;
    max-width: 100%;
    min-width: 100%;
    width: 100%;

    .v-btn {
        border-radius: 0;
        border-color: rgba(255, 255, 255, 0.12);
        border-style: solid;
        border-width: thin;
        box-shadow: none;
        height: 28px;
        opacity: 0.8;
        min-width: auto !important;
    }

    .v-btn:first-child {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }

    .v-btn:last-child {
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .v-btn:not(:first-child) {
        border-left-width: 0;
    }
}

._btn-qs {
    font-size: 0.8rem !important;
    font-weight: 400;
    max-height: 28px;
}
</style>
