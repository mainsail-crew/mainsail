import { computed } from 'vue'
import { useStore } from 'vuex'
import { useSocket } from '@/composables/useSocket'

export function useControl() {
    const store = useStore()
    const socket = useSocket()

    const absolute_coordinates = computed(
        () => store.state.printer?.gcode_move?.absolute_coordinates ?? true
    )

    const enableXYHoming = computed(() => store.state.gui.control.enableXYHoming)

    const feedrateXY = computed(() => store.state.gui.control?.feedrateXY ?? 100)

    const feedrateZ = computed(() => store.state.gui.control?.feedrateZ ?? 10)

    const existsQGL = computed(() => store.getters['printer/existsQGL'])

    const existsZtilt = computed(() => store.getters['printer/existsZtilt'])

    const existsBedTilt = computed(() => store.getters['printer/existsBedTilt'])

    const existsBedScrews = computed(() => store.getters['printer/existsBedScrews'])

    const existsDeltaCalibrate = computed(() => store.getters['printer/existsDeltaCalibrate'])

    const existsScrewsTilt = computed(() => store.getters['printer/existsScrewsTilt'])

    const existsFirmwareRetraction = computed(
        () => store.getters['printer/existsFirmwareRetraction']
    )

    const colorQuadGantryLevel = computed(() => {
        const status = store.state.printer.quad_gantry_level?.applied ?? true
        return status ? 'primary' : 'warning'
    })

    const colorZTilt = computed(() => {
        let status = true
        if ('z_tilt' in store.state.printer) {
            status = store.state.printer.z_tilt?.applied
        } else if ('z_tilt_ng' in store.state.printer) {
            status = store.state.printer.z_tilt_ng?.applied
        }
        return status ? 'primary' : 'warning'
    })

    const defaultActionButton = computed(() => store.getters['gui/getDefaultControlActionButton'])

    const actionButton = computed(() => {
        const button = store.state.gui.control.actionButton ?? defaultActionButton.value
        if (
            (button === 'qgl' && !store.getters['printer/existsQGL']) ||
            (button === 'ztilt' && !store.getters['printer/existsZTilt'])
        ) {
            return defaultActionButton.value
        }
        return button
    })

    const homedAxes = computed(() => store.state.printer?.toolhead?.homed_axes ?? '')

    const xAxisHomed = computed(() => homedAxes.value.includes('x'))

    const yAxisHomed = computed(() => homedAxes.value.includes('y'))

    const zAxisHomed = computed(() => homedAxes.value.includes('z'))

    const macros = computed(() => store.getters['printer/getMacros'])

    const toolchangeMacros = computed(() => {
        const sortToolchangeMacros = (a: string, b: string) => {
            const numberA = parseInt(a.slice(1))
            const numberB = parseInt(b.slice(1))
            return numberA - numberB
        }

        const commands = store.state.printer.gcode?.commands ?? null
        if (commands) {
            return Object.keys(commands)
                .filter((gcode) => gcode.match(/^T\d+/))
                .sort(sortToolchangeMacros)
        }

        return Object.keys(store.state.printer)
            .filter((gcode) => gcode.toLowerCase().match(/^gcode_macro t\d+/))
            .map((gcode) => gcode.slice(gcode.indexOf(' ') + 1))
            .sort(sortToolchangeMacros)
    })

    const existsClientLinearMoveMacro = computed(() => {
        const macros = store.state.printer?.gcode?.commands ?? {}
        return '_CLIENT_LINEAR_MOVE' in macros
    })

    function doHome() {
        store.dispatch('server/addEvent', { message: 'G28', type: 'command' })
        socket.emit('printer.gcode.script', { script: 'G28' }, { loading: 'homeAll' })
    }

    function doHomeX() {
        store.dispatch('server/addEvent', { message: 'G28 X', type: 'command' })
        socket.emit('printer.gcode.script', { script: 'G28 X' }, { loading: 'homeX' })
    }

    function doHomeY() {
        store.dispatch('server/addEvent', { message: 'G28 Y', type: 'command' })
        socket.emit('printer.gcode.script', { script: 'G28 Y' }, { loading: 'homeY' })
    }

    function doHomeXY() {
        store.dispatch('server/addEvent', { message: 'G28 X Y', type: 'command' })
        socket.emit('printer.gcode.script', { script: 'G28 X Y' }, { loading: 'homeXY' })
    }

    function doHomeZ() {
        store.dispatch('server/addEvent', { message: 'G28 Z', type: 'command' })
        socket.emit('printer.gcode.script', { script: 'G28 Z' }, { loading: 'homeZ' })
    }

    function doQGL() {
        store.dispatch('server/addEvent', { message: 'QUAD_GANTRY_LEVEL', type: 'command' })
        socket.emit('printer.gcode.script', { script: 'QUAD_GANTRY_LEVEL' }, { loading: 'qgl' })
    }

    function doZtilt() {
        store.dispatch('server/addEvent', { message: 'Z_TILT_ADJUST', type: 'command' })
        socket.emit('printer.gcode.script', { script: 'Z_TILT_ADJUST' }, { loading: 'zTilt' })
    }

    function doSendMove(gcode: string, feedrate: number) {
        let command =
            `SAVE_GCODE_STATE NAME=_ui_movement\n` +
            `G91\n` +
            `G1 ${gcode} F${feedrate * 60}\n` +
            `RESTORE_GCODE_STATE NAME=_ui_movement`

        if (existsClientLinearMoveMacro.value) {
            gcode = gcode
                .split(' ')
                .map((part) => {
                    const axis = part.slice(0, 1)
                    const value = parseFloat(part.slice(1))
                    return `${axis}=${value}`
                })
                .join(' ')

            command = `_CLIENT_LINEAR_MOVE ${gcode} F=${feedrate * 60}`
        }

        socket.emit('printer.gcode.script', { script: command })
    }

    function doSend(gcode: string) {
        store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        socket.emit('printer.gcode.script', { script: gcode })
    }

    return {
        absolute_coordinates,
        enableXYHoming,
        feedrateXY,
        feedrateZ,
        existsQGL,
        existsZtilt,
        existsBedTilt,
        existsBedScrews,
        existsDeltaCalibrate,
        existsScrewsTilt,
        existsFirmwareRetraction,
        colorQuadGantryLevel,
        colorZTilt,
        defaultActionButton,
        actionButton,
        homedAxes,
        xAxisHomed,
        yAxisHomed,
        zAxisHomed,
        macros,
        toolchangeMacros,
        existsClientLinearMoveMacro,
        doHome,
        doHomeX,
        doHomeY,
        doHomeXY,
        doHomeZ,
        doQGL,
        doZtilt,
        doSendMove,
        doSend,
    }
}
