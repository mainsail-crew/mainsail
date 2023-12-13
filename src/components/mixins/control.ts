import Vue from 'vue'
import Component from 'vue-class-component'
import { PrinterStateMacro, PrinterStateToolchangeMacro } from '@/store/printer/types'

@Component
export default class ControlMixin extends Vue {
    get absolute_coordinates() {
        return this.$store.state.printer?.gcode_move?.absolute_coordinates ?? true
    }

    get enableXYHoming(): boolean {
        return this.$store.state.gui.control.enableXYHoming
    }

    get feedrateXY() {
        return this.$store.state.gui.control?.feedrateXY ?? 100
    }

    get feedrateZ() {
        return this.$store.state.gui.control?.feedrateZ ?? 10
    }

    get existsQGL() {
        return this.$store.getters['printer/existsQGL']
    }

    get existsZtilt() {
        return this.$store.getters['printer/existsZtilt']
    }

    get existsBedTilt() {
        return this.$store.getters['printer/existsBedTilt']
    }

    get existsBedScrews() {
        return this.$store.getters['printer/existsBedScrews']
    }

    get existsDeltaCalibrate() {
        return this.$store.getters['printer/existsDeltaCalibrate']
    }

    get existsScrewsTilt() {
        return this.$store.getters['printer/existsScrewsTilt']
    }

    get existsFirmwareRetraction(): boolean {
        return this.$store.getters['printer/existsFirmwareRetraction']
    }

    get colorQuadGantryLevel() {
        const status = this.$store.state.printer.quad_gantry_level?.applied ?? true

        return status ? 'primary' : 'warning'
    }

    get colorZTilt() {
        const status = this.$store.state.printer.z_tilt?.applied ?? true

        return status ? 'primary' : 'warning'
    }

    get defaultActionButton() {
        return this.$store.getters['gui/getDefaultControlActionButton']
    }

    /**
     * Axes home states
     */

    get homedAxes(): string {
        return this.$store.state.printer?.toolhead?.homed_axes ?? ''
    }

    get xAxisHomed(): boolean {
        return this.homedAxes.includes('x')
    }

    get yAxisHomed(): boolean {
        return this.homedAxes.includes('y')
    }

    get zAxisHomed(): boolean {
        return this.homedAxes.includes('z')
    }

    get macros() {
        return this.$store.getters['printer/getMacros']
    }

    get toolchangeMacros(): PrinterStateToolchangeMacro[] {
        return this.macros
            .filter((macro: PrinterStateMacro) => macro.name.toUpperCase().match(/^T\d+/))
            .sort((a: PrinterStateMacro, b: PrinterStateMacro) => {
                const numberA = parseInt(a.name.slice(1))
                const numberB = parseInt(b.name.slice(1))

                return numberA - numberB
            })
    }

    doHome() {
        this.$store.dispatch('server/addEvent', { message: 'G28', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28' }, { loading: 'homeAll' })
    }

    doHomeX() {
        this.$store.dispatch('server/addEvent', { message: 'G28 X', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28 X' }, { loading: 'homeX' })
    }

    doHomeY() {
        this.$store.dispatch('server/addEvent', { message: 'G28 Y', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28 Y' }, { loading: 'homeY' })
    }

    doHomeXY() {
        this.$store.dispatch('server/addEvent', { message: 'G28 X Y', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28 X Y' }, { loading: 'homeXY' })
    }

    doHomeZ() {
        this.$store.dispatch('server/addEvent', { message: 'G28 Z', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'G28 Z' }, { loading: 'homeZ' })
    }

    doQGL() {
        this.$store.dispatch('server/addEvent', { message: 'QUAD_GANTRY_LEVEL', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'QUAD_GANTRY_LEVEL' }, { loading: 'qgl' })
    }

    doZtilt() {
        this.$store.dispatch('server/addEvent', { message: 'Z_TILT_ADJUST', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'Z_TILT_ADJUST' }, { loading: 'zTilt' })
    }

    doSendMove(gcode: string, feedrate: number) {
        gcode = 'G91' + '\n' + 'G1 ' + gcode + ' F' + feedrate * 60

        if (this.absolute_coordinates) gcode += '\nG90'

        this.doSend(gcode)
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
