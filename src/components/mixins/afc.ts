import Vue from 'vue'
import Component from 'vue-class-component'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

export interface AfcSpoolLaneInfo {
    spoolId: number | undefined
    spool: ServerSpoolmanStateSpool | null
    color: string
    material: string
    filamentVendor: string | undefined
    filamentName: string | undefined
    filamentLoaded: boolean
    remainingWeight: number | undefined
    fullWeight: number | undefined
    spoolPercent: number
    usedWeight: number | undefined
    extruderTemp: number | undefined
    bedTemp: number | undefined
    spoolUrl: string | undefined
}

// AFC's default full-spool weight (g) when no initial_weight is tracked (e.g. no Spoolman spool)
const AFC_DEFAULT_SPOOL_WEIGHT = 1000

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

    getAfcLaneInfo(laneName: string): AfcSpoolLaneInfo {
        const lane = this.getAfcLaneObject(laneName)
        const spoolId: number | undefined = lane?.spool_id ?? undefined
        const spools: ServerSpoolmanStateSpool[] = this.$store.state.server.spoolman?.spools || []
        const spool = spoolId ? (spools.find((s: ServerSpoolmanStateSpool) => s.id === spoolId) ?? null) : null

        // Color: td1_color (when enabled) → spoolman color_hex → lane color
        let color: string
        const afcShowTd1Color: boolean = this.$store.state.gui.view.afc?.showTd1Color ?? false
        if (this.afc?.td1_present && lane?.td1_color && afcShowTd1Color) {
            color = `#${lane.td1_color}`
        } else if (spool?.filament?.color_hex) {
            color = `#${spool.filament.color_hex.replace(/^#/, '')}`
        } else {
            color = lane?.color || ''
        }

        const material = spool?.filament?.material || lane?.material || ''
        const remainingWeight: number | undefined = spool?.remaining_weight ?? lane?.weight

        const fullWeight: number = spool?.initial_weight ?? lane?.initial_weight ?? AFC_DEFAULT_SPOOL_WEIGHT

        let spoolPercent = 100
        if (remainingWeight != null && fullWeight != null && fullWeight > 0) {
            // Clamping to 100 just in case remainingWeight is greater than fillWeight
            // as this could exceed 100
            spoolPercent = Math.min(100, Math.round((remainingWeight / fullWeight) * 100))
        }

        // Use base mixin's spoolManagerUrl if available, otherwise build from store
        const spoolmanBase: string | undefined = this.$store.state.server.config.config?.spoolman?.server ?? undefined
        const spoolUrl =
            spoolmanBase && spoolId ? `${spoolmanBase.replace(/\/$/, '')}/spool/show/${spoolId}` : undefined

        return {
            spoolId,
            spool,
            color,
            material,
            filamentVendor: spool?.filament?.vendor?.name,
            filamentName: spool?.filament?.name || lane?.filament_name || undefined,
            filamentLoaded: lane?.load && lane?.prep,
            remainingWeight,
            fullWeight,
            spoolPercent,
            usedWeight: spool?.used_weight,
            extruderTemp: spool?.filament?.settings_extruder_temp,
            bedTemp: spool?.filament?.settings_bed_temp,
            spoolUrl,
        }
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

    buildAfcMaterialDetails(info: AfcSpoolLaneInfo): string {
        const parts = [info.material || '--']
        if (info.extruderTemp !== undefined) parts.push(`${info.extruderTemp}°C`)
        if (info.bedTemp !== undefined) parts.push(`${info.bedTemp}°C`)

        return parts.join(' | ')
    }

    buildAfcWeightsOutput(info: AfcSpoolLaneInfo): string | undefined {
        if (info.remainingWeight === undefined) return undefined

        const parts = [
            this.$t('Panels.AfcPanel.WeightRemaining', {
                weight: Math.round(info.remainingWeight),
            }).toString(),
        ]

        if (info.usedWeight !== undefined) {
            parts.push(
                this.$t('Panels.AfcPanel.WeightUsed', {
                    weight: Math.round(info.usedWeight),
                }).toString()
            )
        }

        return parts.join(' | ')
    }
}
