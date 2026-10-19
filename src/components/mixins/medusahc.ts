import Vue from 'vue'
import Component from 'vue-class-component'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

// medusahc.current_tool uses -1 for "no hotend mounted" and -2 for "the dock
// sensors disagree", see klippy/extras/medusahc.py in the MedusaHC repository.
export const MEDUSAHC_NO_TOOL = -1
export const MEDUSAHC_SENSOR_ERROR = -2

@Component
export default class MedusahcMixin extends Vue {
    get medusahcExists(): boolean {
        return 'medusahc' in this.$store.state.printer
    }

    get medusahc() {
        return this.$store.state.printer.medusahc ?? {}
    }

    get medusahcCurrentTool(): number {
        return this.medusahc.current_tool ?? MEDUSAHC_NO_TOOL
    }

    get medusahcOperation(): string {
        return this.medusahc.operation ?? 'idle'
    }

    get medusahcLastError(): string {
        return this.medusahc.last_error ?? ''
    }

    get medusahcSensors(): Record<string, number> {
        return this.medusahc.sensors ?? {}
    }

    get medusahcTools(): number[] {
        const count = this.medusahc.tool_count ?? 0

        return [...Array(count).keys()]
    }

    get medusahcExistsSpoolman(): boolean {
        return this.$store.state.server.components.includes('spoolman')
    }

    getMedusahcToolMacro(tool: number) {
        return this.$store.state.printer[`gcode_macro T${tool}`] ?? {}
    }

    getMedusahcExtruderName(tool: number): string {
        return tool === 0 ? 'extruder' : `extruder${tool}`
    }

    getMedusahcSpool(tool: number): ServerSpoolmanStateSpool | null {
        const spoolId = this.getMedusahcToolMacro(tool).spool_id ?? null
        if (spoolId === null) return null

        // active_spool is kept live via websocket, unlike the static spools list
        const activeSpool = this.$store.state.server.spoolman?.active_spool
        if (activeSpool?.id === spoolId) return activeSpool

        const spools: ServerSpoolmanStateSpool[] = this.$store.state.server.spoolman?.spools ?? []

        return spools.find((spool) => spool.id === spoolId) ?? null
    }

    medusahcSend(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
