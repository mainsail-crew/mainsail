import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class ControlMixin extends Vue {

    get absolute_coordinates() {
        return this.$store.state.printer?.gcode_move?.absolute_coordinates ?? true
    }

    get homedAxes(): string {
        return this.$store.state.printer?.toolhead?.homed_axes ?? ''
    }

    get feedrateXY() {
        return this.$store.state.gui.control?.feedrateXY ?? 100
    }

    get feedrateZ() {
        return this.$store.state.gui.control?.feedrateZ ?? 10
    }

    get existsQGL() {
        return 'quad_gantry_level' in this.$store.state.printer.configfile?.settings ?? false
    }

    get existsZtilt() {
        return 'z_tilt' in this.$store.state.printer.configfile?.settings ?? false
    }

    get colorQuadGantryLevel() {
        const status = this.$store.state.printer.quad_gantry_level?.applied ?? true

        return status ? 'primary' : 'warning'
    }

    get colorZTilt() {
        const status = this.$store.state.printer.z_tilt?.applied ?? true

        return status ? 'primary' : 'warning'
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
        gcode = 'G91' + '\n' +
            'G1 ' + gcode + ' F'+feedrate*60

        if (this.absolute_coordinates) gcode += '\nG90'

        this.doSend(gcode)
    }

    doSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}