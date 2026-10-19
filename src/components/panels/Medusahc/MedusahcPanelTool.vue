<template>
    <div class="grey flex-grow-1 medusahc-tool d-flex flex-column" :class="toolClasses">
        <v-row class="flex-grow-0">
            <v-col class="px-6 pt-6 pb-3">
                <v-btn dense small class="w-100 elevation-0" :disabled="selectDisabled" @click="selectTool">
                    {{ toolName }}
                </v-btn>
            </v-col>
        </v-row>
        <v-row class="my-0">
            <v-col class="pl-6 pr-0 py-0 d-flex flex-column">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <span class="d-flex align-center justify-center" v-bind="attrs" v-on="on">
                            <afc-filament-reel
                                :percent="spoolPercent"
                                :color="spoolColor"
                                class="filament-spool"
                                :class="{ 'cursor-pointer': medusahcExistsSpoolman }"
                                @click-spool="onSpoolClick" />
                        </span>
                    </template>
                    <span>
                        <template v-if="spool">
                            <div class="font-weight-bold">{{ spoolHeadline }}</div>
                            <div>{{ filamentName }}</div>
                            <div>{{ spoolWeightsOutput }}</div>
                        </template>
                        <div v-else>{{ $t('Panels.MedusahcPanel.NoSpoolAssigned') }}</div>
                    </span>
                </v-tooltip>
                <spoolman-change-spool-dialog
                    v-if="medusahcExistsSpoolman"
                    v-model="showSpoolmanDialog"
                    :tool="toolName" />
            </v-col>
            <v-col class="pr-6 pl-2 py-0 d-flex flex-column justify-space-between align-end">
                <span class="font-weight-bold">{{ materialOutput }}</span>
                <span class="text--disabled">{{ remainingWeightOutput }}</span>
                <span class="text--disabled text-no-wrap">{{ temperatureOutput }}</span>
            </v-col>
        </v-row>
        <v-row class="mt-0">
            <v-col class="px-6 pt-2 pb-5 text-center">
                <div class="text-truncate">{{ filamentName }}</div>
                <div class="text-caption" :class="dockStateClass">{{ dockStateOutput }}</div>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MedusahcMixin from '@/components/mixins/medusahc'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component
export default class MedusahcPanelTool extends Mixins(BaseMixin, MedusahcMixin) {
    @Prop({ type: Number, required: true }) readonly tool!: number

    showSpoolmanDialog = false

    get toolName(): string {
        return `T${this.tool}`
    }

    get mounted(): boolean {
        return this.medusahcCurrentTool === this.tool
    }

    get toolClasses() {
        return {
            'darken-3': this.$vuetify.theme.dark,
            'lighten-2': !this.$vuetify.theme.dark,
            'border-primary': this.mounted,
        }
    }

    get selectDisabled(): boolean {
        return this.mounted || this.printerIsPrinting || this.medusahcOperation !== 'idle'
    }

    get spool(): ServerSpoolmanStateSpool | null {
        return this.getMedusahcSpool(this.tool)
    }

    get spoolColor(): string {
        const hex = this.spool?.filament?.color_hex ?? this.getMedusahcToolMacro(this.tool).color ?? null
        if (!hex) return 'transparent'

        return hex.startsWith('#') ? hex : `#${hex}`
    }

    get spoolPercent(): number {
        const remaining = this.spool?.remaining_weight
        const initial = this.spool?.initial_weight ?? this.spool?.filament?.weight
        if (this.spool === null) return 0
        if (remaining === undefined || !initial) return 100

        return Math.round((remaining / initial) * 100)
    }

    get spoolHeadline(): string {
        const parts = [`#${this.spool?.id}`]
        const vendor = this.spool?.filament?.vendor?.name
        if (vendor) parts.push(vendor)

        return parts.join(' | ')
    }

    get filamentName(): string {
        return this.spool?.filament?.name ?? '--'
    }

    get materialOutput(): string {
        return this.spool?.filament?.material ?? '--'
    }

    get remainingWeightOutput(): string {
        const remaining = this.spool?.remaining_weight
        if (remaining === undefined) return '--'

        return `${Math.round(remaining)} g`
    }

    get spoolWeightsOutput(): string {
        const remaining = Math.round(this.spool?.remaining_weight ?? 0)
        const used = Math.round(this.spool?.used_weight ?? 0)

        return this.$t('Panels.MedusahcPanel.WeightRemainingUsed', { remaining, used }).toString()
    }

    get extruder() {
        return this.$store.state.printer[this.getMedusahcExtruderName(this.tool)] ?? {}
    }

    get temperatureOutput(): string {
        const temperature = this.extruder.temperature
        if (temperature === undefined) return '--'

        const target = this.extruder.target ?? 0
        const current = `${Math.round(temperature)}°C`

        return target > 0 ? `${current} / ${Math.round(target)}°C` : current
    }

    // Dock hall sensor t<N>: 1 while the hotend sits in its dock.
    get dockSensor(): number | null {
        return this.medusahcSensors[`t${this.tool}`] ?? null
    }

    get dockStateOutput(): string {
        if (this.mounted) return this.$t('Panels.MedusahcPanel.OnToolhead').toString()
        if (this.dockSensor === null) return '--'

        return this.dockSensor === 1
            ? this.$t('Panels.MedusahcPanel.InDock').toString()
            : this.$t('Panels.MedusahcPanel.DockEmpty').toString()
    }

    get dockStateClass() {
        return {
            'primary--text': this.mounted,
            'text--disabled': !this.mounted && this.dockSensor === 1,
            'warning--text': !this.mounted && this.dockSensor === 0,
        }
    }

    selectTool() {
        this.medusahcSend(this.toolName)
    }

    onSpoolClick() {
        if (!this.medusahcExistsSpoolman) return

        this.showSpoolmanDialog = true
    }
}
</script>

<style scoped>
.medusahc-tool {
    border-radius: 8px;
    box-sizing: border-box !important;
    border: 1px solid transparent;
    flex-basis: 0;
    min-width: 140px;
}

.filament-spool {
    max-width: 38px;
}

.v-application .border-primary {
    border-color: var(--v-primary-base) !important;
}
</style>
