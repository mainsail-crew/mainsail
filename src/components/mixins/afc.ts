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
        const printer = this.$store.state.printer ?? {}
        this.afcLanes.forEach((name) => {
            const key_stepper = `AFC_stepper ${name}`
            const key_lane = `AFC_lane ${name}`

            const lane = printer[key_stepper] ?? printer[key_lane] ?? null

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

        const key = `AFC_stepper ${current}`
        const key2 = `AFC_lane ${current}`
        const printer = this.$store.state.printer ?? {}

        return printer[key] ?? printer[key2] ?? null
    }

    get afcCurrentBuffer() {
        const name = this.afcCurrentLane?.buffer ?? null
        if (name === null) return null

        const key = `AFC_buffer ${name}`
        const printer = this.$store.state.printer ?? {}

        return printer[key] ?? null
    }

    get afcCurrentState() {
        return this.afc.current_state ?? ''
    }

    get afcMapList(): string[] {
        const lanes = this.afc.lanes ?? []
        const printer = this.$store.state.printer ?? {}

        const mapList = []
        for (const laneName of lanes) {
            const key = `AFC_stepper ${laneName}`
            const key2 = `AFC_lane ${laneName}`

            const lane = printer[key] ?? printer[key2] ?? null
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
}
