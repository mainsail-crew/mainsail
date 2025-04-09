import Vue from 'vue'
import Component from 'vue-class-component'
import { Extruder, Unit, Message, Lane } from '@/store/server/afc/types'

@Component
export default class AfcMixin extends Vue {
    get existsAfc() {
        return 'AFC' in this.$store.state.printer
    }

    get unitsData(): Unit[] {
        return this.$store.state.server.afc.units ?? []
    }

    get lanesData(): Lane[] {
        return this.$store.state.server.afc.lanes ?? []
    }

    get toolData(): Extruder[] {
        return this.$store.state.server.afc.extruders ?? []
    }

    get afcMessage(): Message {
        return this.$store.state.printer.AFC.message ?? { message: '', type: '' }
    }

    get currentLane(): Lane {
        return this.$store.state.server.afc.current_lane ?? null
    }

    get currentLoad(): Lane {
        return this.$store.state.server.afc.current_load ?? null
    }

    get nextLane(): Lane {
        return this.$store.state.server.afc.next_lane ?? null
    }

    get currentState(): string {
        return this.$store.state.printer.AFC.current_state ?? ''
    }

    get errorState(): boolean {
        return this.$store.state.printer.AFC.error_state ?? false
    }

    get bypassState(): boolean {
        return this.$store.state.printer.AFC.bypass_state ?? false
    }

    get mapList(): string[] {
        return this.$store.state.server.afc.mapList ?? []
    }

    get laneList(): string[] {
        return this.$store.state.server.afc.laneList ?? []
    }

    get currentFilamentChange() {
        if (!this.existsAfc) return null

        return this.$store.state.printer.AFC.current_toolchange ?? null
    }

    get maxFilamentChanges() {
        if (!this.existsAfc) return null

        return this.$store.state.printer.AFC.number_of_toolchanges ?? null
    }

    get spoolManagerUrl() {
        return this.$store.state.server.config.config?.spoolman?.server ?? null
    }

    get showSpoolName(): boolean {
        return this.$store.state.gui.view.afc.showSpoolName ?? true
    }

    get showUnitIcons(): boolean {
        return this.$store.state.gui.view.afc.showUnitIcons ?? true
    }

    get showInfiniteSpool(): boolean {
        return this.$store.state.gui.view.afc.infiniteSpool ?? true
    }

    get autoExpandUnits(): boolean {
        return this.$store.state.gui.view.afc.autoExpandUnits ?? true
    }

    get autoExpandTools(): boolean {
        return this.$store.state.gui.view.afc.autoExpandTools ?? true
    }

    unitIcon(unit_type: string): string {
        const customIconUrl = this.$store.getters['files/getUnitIcon'](unit_type)
        return customIconUrl ?? `/img/afc/${unit_type}.svg`
    }
}
