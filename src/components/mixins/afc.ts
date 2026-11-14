import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

// AFC's default full-spool weight (g) when no initial_weight is tracked (e.g. no Spoolman spool)
const AFC_DEFAULT_SPOOL_WEIGHT = 1000

@Component
export default class AfcMixin extends Mixins(BaseMixin) {
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

    // Looks up a spoolman spool by id, preferring active_spool since it is kept
    // live via websocket, unlike the static spools list
    getAfcSpool(spoolId: number | undefined): ServerSpoolmanStateSpool | null {
        if (!spoolId) return null

        const activeSpool: ServerSpoolmanStateSpool | null = this.$store.state.server.spoolman?.active_spool ?? null
        if (activeSpool?.id === spoolId) return activeSpool

        const spools: ServerSpoolmanStateSpool[] = this.$store.state.server.spoolman?.spools || []
        return spools.find((s: ServerSpoolmanStateSpool) => s.id === spoolId) ?? null
    }

    // Link to the spool in Spoolman. spoolManagerUrl swaps a localhost/loopback host
    // for the printer's hostname so remote browsers can reach it
    getAfcSpoolUrl(spoolId: number | undefined): string | undefined {
        if (!this.spoolManagerUrl || !spoolId) return undefined

        return `${this.spoolManagerUrl.replace(/\/$/, '')}/spool/show/${spoolId}`
    }

    // Color decision order: td1_color (when enabled) -> spoolman color_hex -> lane color from AFC
    getAfcLaneColor(laneName: string, spool: ServerSpoolmanStateSpool | null): string {
        const lane = this.getAfcLaneObject(laneName)
        const afcShowTd1Color: boolean = this.$store.state.gui.view.afc?.showTd1Color ?? false

        if (this.afc?.td1_present && lane?.td1_color && afcShowTd1Color) return `#${lane.td1_color}`
        if (spool?.filament?.color_hex) return `#${spool.filament.color_hex.replace(/^#/, '')}`

        return lane?.color || ''
    }

    // Full weight prefers the spoolman value, then the AFC lane value, then AFC's default spool weight
    getAfcLaneFullWeight(laneName: string, spool: ServerSpoolmanStateSpool | null): number {
        const lane = this.getAfcLaneObject(laneName)

        return spool?.initial_weight ?? lane?.initial_weight ?? AFC_DEFAULT_SPOOL_WEIGHT
    }

    getAfcSpoolPercent(remainingWeight: number | undefined, fullWeight: number): number {
        if (remainingWeight === undefined || fullWeight <= 0) return 100

        // Clamping to 100 just in case remainingWeight is greater than fullWeight
        // as this could exceed 100
        return Math.min(100, Math.round((remainingWeight / fullWeight) * 100))
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

    // Builds "material | extruder temp | bed temp" display string, skipping missing temps
    buildAfcMaterialDetails(material: string, extruderTemp: number | undefined, bedTemp: number | undefined): string {
        const parts = [material || '--']
        if (extruderTemp !== undefined) parts.push(`${extruderTemp}°C`)
        if (bedTemp !== undefined) parts.push(`${bedTemp}°C`)

        return parts.join(' | ')
    }

    // Builds translated "remaining | used" weight display string, or undefined when remaining weight is unknown
    buildAfcWeightsOutput(remainingWeight: number | undefined, usedWeight: number | undefined): string | undefined {
        if (remainingWeight === undefined) return undefined

        const parts = [
            this.$t('Panels.AfcPanel.WeightRemaining', {
                weight: Math.round(remainingWeight),
            }).toString(),
        ]

        if (usedWeight !== undefined) {
            parts.push(
                this.$t('Panels.AfcPanel.WeightUsed', {
                    weight: Math.round(usedWeight),
                }).toString()
            )
        }

        return parts.join(' | ')
    }
}
