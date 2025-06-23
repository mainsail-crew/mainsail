import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class AfcMixin extends Vue {
    get afc() {
        return this.$store.state.printer.AFC ?? {}
    }

    get afcExtruders(): string[] {
        return this.afc.extruders ?? []
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

        const mapList = []
        for (const laneName of lanes) {
            const lane = this.getAfcLaneObject(laneName)
            if (lane === null) continue

            mapList.push(lane.map)
        }

        return mapList.sort()
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
