import Vue from 'vue'
import Component from 'vue-class-component'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import { FileStateGcodefile } from '@/store/files/types'
import { TinyColor } from '@ctrl/tinycolor'
import { convertStringToArray, getFileFilamentColors } from '@/plugins/helpers'

// sRGB hex -> CIE Lab (D65), used for perceptual color distance
const hexToLab = (hex: string): [number, number, number] | undefined => {
    const color = new TinyColor(hex)
    if (!color.isValid) return undefined
    const { r, g, b } = color.toRgb()
    const lin = (c: number) => ((c /= 255) > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92)
    const [lr, lg, lb] = [lin(r), lin(g), lin(b)]
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
    const x = f((lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047)
    const y = f(lr * 0.2126 + lg * 0.7152 + lb * 0.0722)
    const z = f((lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883)
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

@Component
export default class AfcMixin extends Vue {
    get afcExists() {
        return 'AFC' in this.$store.state.printer
    }

    get afc() {
        return this.$store.state.printer.AFC ?? {}
    }

    get afcExtruders(): string[] {
        return this.afc.extruders ?? []
    }

    get afcHubs(): string[] {
        return this.afc.hubs ?? []
    }

    get afcUnits(): string[] {
        return this.afc.units ?? []
    }

    get afcLanes(): string[] {
        return this.afc.lanes ?? []
    }

    get afcLoadedSpools() {
        if (this.afcLanes.length === 0) return []

        const spoolIds: { lane: string; spoolId: number }[] = []
        this.afcLanes.forEach((name) => {
            const lane = this.getAfcLaneObject(name)
            if (!lane || !lane.spool_id) return

            spoolIds.push({
                lane: name,
                spoolId: lane.spool_id,
            })
        })

        return spoolIds
    }

    get afcErrorState() {
        return this.afc.error_state ?? false
    }

    get afcCurrentLane() {
        const current = this.afc.current_load ?? this.afc.current_lane ?? null
        if (current === null) return null

        return this.getAfcLaneObject(current)
    }

    get afcCurrentBuffer() {
        const name = this.afcCurrentLane?.buffer ?? null
        if (name === null) return null

        return this.getAfcBufferObject(name)
    }

    get afcCurrentState() {
        return this.afc.current_state ?? ''
    }

    get afcMapList(): string[] {
        const lanes = this.afc.lanes ?? []
        const seen = new Set<string>()

        for (const laneName of lanes) {
            const lane = this.getAfcLaneObject(laneName)
            if (!lane?.map) continue

            const tools = Array.isArray(lane.map) ? lane.map : [lane.map]
            for (const tool of tools) {
                if (tool) seen.add(tool)
            }
        }

        return [...seen].sort((a, b) => a.localeCompare(b))
    }

    get afcExistsSpoolman() {
        return this.$store.state.server.components.includes('spoolman')
    }

    get afcShowFilamentName(): boolean {
        return this.$store.state.gui.view.afc?.showFilamentName ?? false
    }

    get afcShowLaneInfinite(): boolean {
        return this.$store.state.gui.view.afc?.showLaneInfinite ?? true
    }

    get afcShowUnitIcons(): boolean {
        return this.$store.state.gui.view.afc?.showUnitIcons ?? true
    }

    get afcHiddenExtruders(): string[] {
        return this.$store.state.gui.view.afc?.hiddenExtruders ?? []
    }

    get afcHiddenUnits(): string[] {
        return this.$store.state.gui.view.afc?.hiddenUnits ?? []
    }

    get afcCurrentToolchange() {
        return this.afc.current_toolchange ?? undefined
    }

    getPrinterObject(key: string) {
        const printer = this.$store.state.printer ?? {}
        return printer[key] ?? null
    }

    getPrinterSettings(key: string) {
        const settings = this.$store.state.printer.configfile?.settings ?? {}

        return settings[key.toLowerCase()] ?? null
    }

    getAfcLaneObject(lane: string) {
        const key_stepper = `AFC_stepper ${lane}`
        const key_lane = `AFC_lane ${lane}`
        return this.getPrinterObject(key_stepper) ?? this.getPrinterObject(key_lane) ?? {}
    }

    getAfcLaneSettings(lane: string) {
        const key_stepper = `AFC_stepper ${lane}`
        const key_lane = `AFC_lane ${lane}`
        return this.getPrinterSettings(key_stepper) ?? this.getPrinterSettings(key_lane) ?? {}
    }

    getAfcLaneFilament(laneName: string) {
        const lane = this.getAfcLaneObject(laneName)
        const spoolId = lane?.spool_id ?? 0
        const spools = this.$store.state.server.spoolman?.spools || []
        const spool = spools.find((spool: ServerSpoolmanStateSpool) => spool.id === spoolId) || null

        return {
            color: lane?.color ?? '#000000',
            name: spool?.filament?.name ?? '--',
            type: lane?.material ?? '--',
            weight: lane?.weight ?? 0,
        }
    }

    // Map each used tool to the closest loaded lane: same material first, then by color,
    // then the lane the tool is already mapped to (keeps results deterministic without color data).
    // Lanes are assigned once, so the resulting SET_MAP sequence is order independent.
    afcAutoMap(file: FileStateGcodefile) {
        const fileColors = getFileFilamentColors(file)
        const fileTypes = convertStringToArray(file.filament_type ?? '')
        const usedTools = (file.filament_weights ?? []).flatMap((weight, tool) => (weight > 0 ? [tool] : []))

        const lanes = this.afcLanes
            .map((lane) => ({ lane, object: this.getAfcLaneObject(lane) }))
            .filter(({ object }) => object.load && object.prep)

        const isMapped = (lane: string, tool: number) => {
            const map = this.getAfcLaneObject(lane).map
            const tools: string[] = Array.isArray(map) ? map : [map]
            return tools.some((t) => t?.toLowerCase() === `t${tool}`)
        }

        const pairs = usedTools
            .flatMap((tool) => {
                const color = fileColors[tool]
                const type = (fileTypes[tool] ?? '').toLowerCase()
                const lab1 = color ? hexToLab(color) : undefined

                return lanes.map(({ lane, object }) => {
                    const lab2 = object.color ? hexToLab(object.color) : undefined
                    const mismatch = type && (object.material ?? '').toLowerCase() !== type ? 1 : 0
                    const distance =
                        lab1 && lab2 ? Math.hypot(lab1[0] - lab2[0], lab1[1] - lab2[1], lab1[2] - lab2[2]) : Infinity
                    return { tool, lane, mismatch, distance, current: isMapped(lane, tool) ? 0 : 1 }
                })
            })
            .sort((a, b) => a.mismatch - b.mismatch || a.distance - b.distance || a.current - b.current)

        const usedLanes = new Set<string>()
        const mapped = new Set<number>()
        const gcode: string[] = []

        for (const { tool, lane } of pairs) {
            if (mapped.has(tool) || usedLanes.has(lane)) continue
            mapped.add(tool)
            usedLanes.add(lane)

            if (!isMapped(lane, tool)) {
                gcode.push(`SET_MAP LANE=${lane} MAP=T${tool}`)
            }
        }

        if (gcode.length === 0) return

        const script = gcode.join('\n')
        this.$store.dispatch('server/addEvent', { message: script, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script })
    }

    getAfcExtruderObject(extruder: string) {
        const key_extruder = `AFC_extruder ${extruder}`
        return this.getPrinterObject(key_extruder) ?? {}
    }

    getAfcExtruderSettings(extruder: string) {
        const key = `AFC_extruder ${extruder}`
        return this.getPrinterSettings(key) ?? {}
    }

    getAfcBufferObject(buffer: string) {
        const key_buffer = `AFC_buffer ${buffer}`
        return this.getPrinterObject(key_buffer)
    }

    getAfcHubObject(hub: string) {
        const key = `AFC_hub ${hub}`
        return this.getPrinterObject(key) ?? {}
    }
}
