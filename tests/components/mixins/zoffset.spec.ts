import { describe, expect, it } from 'vitest'
import ZoffsetMixin from '@/components/mixins/zoffset'

const createMixin = (printerState: Record<string, unknown>) => {
    const mixin = new ZoffsetMixin()

    Object.defineProperty(mixin, '$store', {
        value: {
            state: {
                printer: printerState,
            },
        },
    })

    return mixin
}

describe('ZoffsetMixin', () => {
    it('uses stepper_a for delta printers', () => {
        const mixin = createMixin({
            configfile: {
                settings: {
                    printer: {
                        kinematics: 'delta',
                    },
                },
            },
        })

        expect(mixin.stepper_name).toBe('stepper_a')
    })

    it('uses carriage carriage_z for generic_cartesian printers', () => {
        const mixin = createMixin({
            configfile: {
                settings: {
                    printer: {
                        kinematics: 'generic_cartesian',
                    },
                },
            },
        })

        expect(mixin.stepper_name).toBe('carriage carriage_z')
    })

    it('uses stepper_z for conventional cartesian-style printers', () => {
        const mixin = createMixin({
            configfile: {
                settings: {
                    printer: {
                        kinematics: 'corexy',
                    },
                },
            },
        })

        expect(mixin.stepper_name).toBe('stepper_z')
    })

    it('detects probe virtual endstops on generic_cartesian Z carriages', () => {
        const mixin = createMixin({
            configfile: {
                settings: {
                    printer: {
                        kinematics: 'generic_cartesian',
                    },
                    'carriage carriage_z': {
                        endstop_pin: 'probe:z_virtual_endstop',
                    },
                },
            },
        })

        expect(mixin.endstop_pin).toBe('probe:z_virtual_endstop')
        expect(mixin.isEndstopProbe).toBe(true)
    })

    it('does not throw when the Z endstop config is missing', () => {
        const mixin = createMixin({
            configfile: {
                settings: {
                    printer: {
                        kinematics: 'generic_cartesian',
                    },
                },
            },
        })

        expect(mixin.endstop_pin).toBeNull()
        expect(mixin.isEndstopProbe).toBe(false)
    })

    it('shows the endstop save button for non-zero generic_cartesian gcode offsets', () => {
        const mixin = createMixin({
            gcode_move: {
                homing_origin: [0, 0, -0.15],
            },
            gcode: {
                commands: {
                    Z_OFFSET_APPLY_ENDSTOP: {},
                },
            },
            configfile: {
                settings: {
                    printer: {
                        kinematics: 'generic_cartesian',
                    },
                    'carriage carriage_z': {
                        endstop_pin: '^duet:PC5',
                    },
                },
            },
        })

        expect(mixin.showSaveButton).toBe(true)
        expect(mixin.autoSaveZOffsetOption).toBe('Z_OFFSET_APPLY_ENDSTOP')
    })
})
