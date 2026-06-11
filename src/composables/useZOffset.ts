import { computed } from 'vue'
import { useStore } from 'vuex'

export function useZOffset() {
    const store = useStore()

    const homing_origin = computed(() => store.state.printer?.gcode_move?.homing_origin ?? [])

    const z_gcode_offset = computed(() => {
        const origin = homing_origin.value
        return origin.length > 1 ? Math.round(origin[2] * 1000) / 1000 : 0
    })

    const commands = computed(() => store.state.printer.gcode?.commands ?? {})

    const settings = computed(() => store.state.printer.configfile?.settings ?? {})

    const kinematics = computed(() => settings.value.printer?.kinematics ?? 'cartesian')

    const stepper_name = computed(() => {
        if (kinematics.value === 'delta') return 'stepper_a'
        return 'stepper_z'
    })

    const endstop_pin = computed(() => {
        const pin = settings.value[stepper_name.value]?.endstop_pin
        return pin?.trim() ?? null
    })

    const zOffset = computed(() => store.state.printer?.gcode_move?.homing_origin[2].toFixed(3))

    const isEndstopProbe = computed(() => {
        if (!endstop_pin.value) return false
        return endstop_pin.value.replaceAll(' ', '').search('probe:z_virtual_endstop') !== -1
    })

    const existZOffsetApplyProbe = computed(
        () => 'Z_OFFSET_APPLY_PROBE' in commands.value
    )

    const existZOffsetApplyEndstop = computed(
        () => 'Z_OFFSET_APPLY_ENDSTOP' in commands.value
    )

    const showSaveButton = computed(() => {
        if (z_gcode_offset.value === 0) return false
        if (isEndstopProbe.value && existZOffsetApplyProbe.value) return true
        return !isEndstopProbe.value && existZOffsetApplyEndstop.value
    })

    const autoSaveZOffsetOption = computed(() => {
        if (isEndstopProbe.value && existZOffsetApplyProbe.value) return 'Z_OFFSET_APPLY_PROBE'
        return 'Z_OFFSET_APPLY_ENDSTOP'
    })

    return {
        homing_origin,
        z_gcode_offset,
        commands,
        settings,
        kinematics,
        stepper_name,
        endstop_pin,
        zOffset,
        isEndstopProbe,
        existZOffsetApplyProbe,
        existZOffsetApplyEndstop,
        showSaveButton,
        autoSaveZOffsetOption,
    }
}
