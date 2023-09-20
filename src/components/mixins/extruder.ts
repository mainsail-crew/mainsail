import Vue from 'vue'
import { Component } from 'vue-property-decorator'
@Component
export default class ExtruderMixin extends Vue {
    get activeExtruder(): string {
        return this.$store.state.printer.toolhead?.extruder
    }

    get activeExtruderSettings(): any {
        return this.$store.state.printer.configfile?.settings?.[this.activeExtruder]
    }

    get filamentDiameter(): number {
        return this.activeExtruderSettings?.filament_diameter ?? 1.75
    }

    get nozzleDiameter(): number {
        return this.activeExtruderSettings?.nozzle_diameter ?? 0.4
    }

    get feedamount(): number {
        return parseFloat(this.$store.state.gui.control.extruder.feedamount)
    }

    get feedrate(): number {
        return parseFloat(this.$store.state.gui.control.extruder.feedrate)
    }

    get extrudeFactor() {
        return this.$store.state.printer?.gcode_move?.extrude_factor ?? 1
    }

    get extrudePossible(): boolean {
        return this.$store.getters['printer/getExtrudePossible']
    }

    get minExtrudeTemp(): number {
        return this.activeExtruderSettings?.min_extrude_temp ?? 170
    }
}
