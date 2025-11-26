<template>
    <div>
        <h3 class="text-h5 mb-3 mt-5">{{ title }}</h3>

        <settings-row :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.Enable')" dense>
            <v-switch v-model="ledsEnable" :label="$t('Panels.MmuPanel.MmuMaintenanceDialog.Enable')" hide-details />
            <v-switch
                v-model="ledsAnimation"
                :label="$t('Panels.MmuPanel.MmuMaintenanceDialog.Animation')"
                hide-details
                class="ml-5" />
        </settings-row>
        <settings-row
            v-if="existsEntryLed"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.EntryLeds')"
            :sub-title="$t('Panels.MmuPanel.MmuMaintenanceDialog.EntryLedsDescription')"
            dense>
            <v-select v-model="entryEffect" :items="options" hide-details outlined dense />
        </settings-row>
        <settings-row
            v-if="existsExitLed"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.ExitLeds')"
            :sub-title="$t('Panels.MmuPanel.MmuMaintenanceDialog.ExitLedsDescription')"
            dense>
            <v-select v-model="exitEffect" :items="options" hide-details outlined dense />
        </settings-row>
        <settings-row
            v-if="existsStatusLed"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.StatusLeds')"
            :sub-title="$t('Panels.MmuPanel.MmuMaintenanceDialog.StatusLedsDescription')"
            dense>
            <v-select v-model="statusEffect" :items="statusOptions" hide-details outlined dense />
        </settings-row>

        <v-divider class="my-6" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import { convertName, toBoolean } from '@/plugins/helpers'

@Component
export default class MmuMaintenanceStateDialogLeds extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly unitName!: string

    get title() {
        return `MMU Leds - ${convertName(this.unitName)}`
    }

    get mmuLeds() {
        const key = `mmu_leds ${this.unitName}`

        return this.$store.state.printer[key] ?? {}
    }

    get mmuLedsSettings() {
        const key = `mmu_leds ${this.unitName}`

        return this.$store.state.printer.configfile?.settings?.[key] ?? {}
    }

    get ledsEnable() {
        return toBoolean(this.mmuLeds.enabled ?? 'False')
    }

    set ledsEnable(newVal: boolean) {
        this.updateLedSettings('ENABLE', newVal ? '1' : '0')
    }

    get ledsAnimation(): boolean {
        return toBoolean(this.mmuLeds.animation ?? 'False')
    }

    set ledsAnimation(newVal: boolean) {
        this.updateLedSettings('ANIMATION', newVal ? '1' : '0')
    }

    get existsEntryLed() {
        const pins = this.mmuLedsSettings?.entry_leds ?? ''

        return pins !== ''
    }

    get entryEffect(): string {
        return this.mmuLeds.entry_effect ?? 'off'
    }

    set entryEffect(newVal: string) {
        this.updateLedSettings('ENTRY_EFFECT', newVal)
    }

    get existsExitLed() {
        const pins = this.mmuLedsSettings?.exit_leds ?? ''

        return pins !== ''
    }

    get exitEffect(): string {
        return this.mmuLedsSettings.exit_effect ?? 'off'
    }

    set exitEffect(newVal: string) {
        this.updateLedSettings('EXIT_EFFECT', newVal)
    }

    get existsStatusLed() {
        const pins = this.mmuSettings?.status_leds ?? ''

        return pins !== ''
    }

    get statusEffect(): string {
        return this.mmuLedsSettings.status_effect ?? 'off'
    }

    set statusEffect(newVal: string) {
        this.updateLedSettings('STATUS_EFFECT', newVal)
    }

    get options() {
        return [
            { value: 'off', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.Off') },
            { value: 'gate_status', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.GateStatus') },
            { value: 'filament_color', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.FilamentColor') },
            { value: 'slicer_color', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.SlicerColor') },
        ]
    }

    get statusOptions() {
        const options = [...this.options]
        options.push({ value: 'on', text: this.$t('Panels.MmuPanel.MmuMaintenanceDialog.LedOptions.On') })

        return options
    }

    updateLedSettings(attribute: string, value: string) {
        this.doSend(`MMU_LED QUIET=1 ${attribute}=${value}`)
    }
}
</script>
