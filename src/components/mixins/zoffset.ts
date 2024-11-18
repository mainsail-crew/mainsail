import Vue from 'vue'
import Component from 'vue-class-component'
import { CommandHelp } from '@/store/printer/types'

@Component
export default class ZoffsetMixin extends Vue {
    get homing_origin() {
        return this.$store.state.printer?.gcode_move?.homing_origin ?? []
    }

    get z_gcode_offset() {
        return this.homing_origin.length > 1 ? Math.round(this.homing_origin[2] * 1000) / 1000 : 0
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

        return stepperConfig?.endstop_pin.trim()
    }

    get zOffset(): number {
        return this.$store.state.printer?.gcode_move?.homing_origin[2].toFixed(3)
    }
    get isEndstopProbe() {
        // remove spaces and search for probe:z_virtual_endstop
        return this.endstop_pin.replaceAll(' ', '').search('probe:z_virtual_endstop') !== -1
    }

    get existZOffsetApplyProbe() {
        return this.helplist.findIndex((gcode: CommandHelp) => gcode.commandLow === 'z_offset_apply_probe') !== -1
    }

    get existZOffsetApplyEndstop() {
        return this.helplist.findIndex((gcode: CommandHelp) => gcode.commandLow === 'z_offset_apply_endstop') !== -1
    }

    get showSaveButton() {
        // hide button when offset is 0
        if (this.z_gcode_offset === 0) return false

        // show button when z endstop is probe and probe gcode exists
        if (this.isEndstopProbe && this.existZOffsetApplyProbe) return true

        // show button when z endstop is endstop and endstop gcode exists
        return !this.isEndstopProbe && this.existZOffsetApplyEndstop
    }

    get autoSaveZOffsetOption() {
        if (this.isEndstopProbe && this.existZOffsetApplyProbe) return 'Z_OFFSET_APPLY_PROBE'

        return 'Z_OFFSET_APPLY_ENDSTOP'
    }
}
