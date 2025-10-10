<template>
    <v-container>
        <v-row>
            <v-col class="pt-0 text-subtitle-2 text--secondary">
                {{ spoolmanSupportOutput }}
            </v-col>
        </v-row>

        <!-- GATE DETAILS-->
        <v-row>
            <v-col cols="12" md="6">
                <v-row>
                    <v-col v-if="!hideSpoolmanSwitch" cols="6" class="d-flex align-center">
                        <v-switch
                            v-model="useSpoolman"
                            :label="$t('Panels.MmuPanel.GateMapDialog.Spoolman')"
                            hide-details
                            class="pt-0 mt-0"
                            @change="resetSpoolId" />
                    </v-col>
                    <v-col :cols="hideSpoolmanSwitch ? 12 : 6">
                        <v-text-field
                            v-model="spoolId"
                            type="number"
                            :label="$t('Panels.MmuPanel.GateMapDialog.SpoolmanId')"
                            :rules="spoolIdRules"
                            :disabled="disableSpoolId"
                            :hide-spin-buttons="disableSpoolId"
                            outlined
                            dense
                            hide-details />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model.trim="filamentName"
                            :label="$t('Panels.MmuPanel.GateMapDialog.FilamentName')"
                            :disabled="disableFilamentFields"
                            outlined
                            dense
                            clearable
                            hide-details />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-text-field
                            v-model.trim="filamentMaterial"
                            :label="$t('Panels.MmuPanel.GateMapDialog.Material')"
                            :disabled="disableFilamentFields"
                            outlined
                            dense
                            clearable
                            hide-details />
                    </v-col>
                    <v-col cols="4" class="offset-2">
                        <v-text-field
                            v-model="filamentTemperature"
                            type="number"
                            :label="$t('Panels.MmuPanel.GateMapDialog.Temperature')"
                            :disabled="disableFilamentFields"
                            :hide-spin-buttons="disableFilamentFields"
                            suffix="°C"
                            :rules="temperatureRules"
                            outlined
                            dense
                            hide-details />
                    </v-col>
                </v-row>
                <v-divider class="my-6" />
                <v-row>
                    <v-col>
                        <v-switch v-model="gateStatusSwitch" :label="gateStatusLabel" hide-details class="pt-0 mt-0" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-subheader class="px-0 height-auto">
                            <v-icon small class="mr-2">{{ mdiSpeedometer }}</v-icon>
                            <span>{{ $t('Panels.MmuPanel.GateMapDialog.LoadSpeed') }}</span>
                            <v-spacer />
                            <v-text-field
                                v-model="speedOverride"
                                type="number"
                                suffix="%"
                                hide-spin-buttons
                                hide-details
                                outlined
                                dense
                                readonly
                                class="_slider-input d-flex align-center pt-1">
                                <template v-if="speedOverride !== 100" #append>
                                    <v-icon small @click="resetSpeed">{{ mdiRestart }}</v-icon>
                                </template>
                            </v-text-field>
                        </v-subheader>

                        <v-slider
                            v-model="speedOverride"
                            class="px-0 pt-2 pb-0"
                            :min="FILAMENT_SPEED_OVERRIDE_MIN"
                            :max="FILAMENT_SPEED_OVERRIDE_MAX"
                            hide-details>
                            <template #prepend>
                                <v-icon
                                    :disabled="speedOverride <= FILAMENT_SPEED_OVERRIDE_MIN"
                                    @click="decrementSpeed">
                                    {{ mdiMinus }}
                                </v-icon>
                            </template>
                            <template #append>
                                <v-icon
                                    :disabled="speedOverride >= FILAMENT_SPEED_OVERRIDE_MAX"
                                    @click="incrementSpeed">
                                    {{ mdiPlus }}
                                </v-icon>
                            </template>
                        </v-slider>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="12" md="6" class="d-flex justify-center align-center">
                <v-color-picker
                    v-if="!useSpoolman"
                    :value="filamentColor"
                    hide-inputs
                    swatches-max-height="120px"
                    show-swatches
                    mode="hexa"
                    show-alpha
                    hide-opacity="false"
                    @update:color="selectFilamentColor" />
                <div v-else>
                    <div :class="!spoolIdExists ? 'no-spool' : ''">
                        <spool-icon
                            class="w-100"
                            height="120"
                            :color="spoolmanColor"
                            @click-spool="showSpoolmanSpoolChooserDialog = true" />
                        <div class="pt-4">{{ $t('Panels.SpoolmanPanel.LastUsed') }}: {{ spoolmanLastUsed }}</div>
                        <div>
                            <strong>{{ spoolmanRemainingWeight }}</strong>
                            <small class="ml-1">/ {{ spoolmanTotalWeight }}</small>
                        </div>
                    </div>
                    <div class="mt-3">
                        <v-btn color="secondary" @click="showSpoolmanSpoolChooserDialog = true">
                            <v-icon left>{{ mdiAdjust }}</v-icon>
                            {{ $t('Panels.MmuPanel.GateMapDialog.ChooseSpool') }}
                        </v-btn>
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- SPOOLMAN (ADAPTED) SPOOL SELECTOR -->
        <spoolman-change-spool-dialog
            :show-dialog="showSpoolmanSpoolChooserDialog"
            :set-active-spool="false"
            @select-spool="selectSpoolmanSpool"
            @close="showSpoolmanSpoolChooserDialog = false" />
    </v-container>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    GATE_EMPTY,
    GATE_AVAILABLE,
    GATE_AVAILABLE_FROM_BUFFER,
    GATE_UNKNOWN,
    FILAMENT_SPEED_OVERRIDE_MIN,
    FILAMENT_SPEED_OVERRIDE_MAX,
} from '@/components/mixins/mmu'
import type { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import { mdiSpeedometer, mdiRestart, mdiMinus, mdiPlus, mdiAdjust } from '@mdi/js'
import { Debounce } from 'vue-debounce-decorator'
import { VColorPickerColor } from 'vuetify/src/components/VColorPicker/util'

@Component
export default class MmuEditGateMapDialogGateDetails extends Mixins(BaseMixin, MmuMixin) {
    FILAMENT_SPEED_OVERRIDE_MIN = FILAMENT_SPEED_OVERRIDE_MIN
    FILAMENT_SPEED_OVERRIDE_MAX = FILAMENT_SPEED_OVERRIDE_MAX

    mdiSpeedometer = mdiSpeedometer
    mdiRestart = mdiRestart
    mdiMinus = mdiMinus
    mdiPlus = mdiPlus
    mdiAdjust = mdiAdjust

    @Prop({ required: true }) readonly selectedGate!: number

    useSpoolman = false
    showSpoolmanSpoolChooserDialog = false

    @Watch('selectedGate', { immediate: true })
    onSelectedGateChanged() {
        this.useSpoolman = this.spoolId === null || this.spoolId > 0
    }

    get extruderSettings() {
        return this.$store.state.server.printer?.extruder ?? undefined
    }

    get minExtruderTemp() {
        return this.extruderSettings?.min_extrude_temp ?? 170
    }

    get maxExtruderTemp() {
        return this.extruderSettings?.max_temp ?? 290
    }

    get spoolmanSupportOutput() {
        if (this.spoolmanSupport === 'off') return this.$t('Panels.MmuPanel.GateMapDialog.SpoolmanOff')
        else if (this.spoolmanSupport === 'pull') return this.$t('Panels.MmuPanel.GateMapDialog.SpoolmanPull')

        return this.$t('Panels.MmuPanel.GateMapDialog.SpoolmanOther', { mode: this.spoolmanSupport })
    }

    get spoolmanSpools() {
        return this.$store.state.server.spoolman?.spools ?? []
    }

    get spoolIdRules() {
        return [
            (val: string | number) => {
                const numValue = typeof val === 'string' ? parseInt(val) : val
                if (!numValue || numValue <= 0) return true
                const spoolExists = this.spoolmanSpools.some((spool: ServerSpoolmanStateSpool) => spool.id === numValue)
                return spoolExists ? true : this.$t('Panels.MmuPanel.GateMapDialog.NoMatchingSpool')
            },
        ]
    }

    get spoolId() {
        return this.mmu?.gate_spool_id[this.selectedGate] ?? -1
    }

    set spoolId(newSpoolId: number | string) {
        const spool_id = typeof newSpoolId !== 'number' ? parseInt(newSpoolId) : newSpoolId
        if (isNaN(spool_id)) return

        const isValid = this.spoolIdRules.every((rule) => rule(spool_id) === true)
        if (!isValid) return

        if (spool_id === -1) {
            this.resetSpoolId()
            return
        }

        const spool = this.spoolmanSpools.find((spool: ServerSpoolmanStateSpool) => spool.id === spool_id)
        if (!spool) return

        const name = String(spool?.filament?.name ?? this.$t('Panels.MmuPanel.Unknown')).replace(/["']/g, '')
        const material = String(spool?.filament?.material ?? this.$t('Panels.MmuPanel.Unknown')).replace(/["']/g, '')
        const color = this.formColorString(spool?.filament?.color_hex).slice(1)
        const temperature = spool?.filament?.settings_extruder_temp ?? -1

        const gcode = `MMU_GATE_MAP GATE=${this.selectedGate} SPOOLID=${spool_id} NAME="${name}" MATERIAL="${material}" COLOR="${color}" TEMP=${temperature} QUIET=1`
        this.doSend(gcode)
    }

    get spoolIdExists() {
        return this.spoolmanSpool ?? false
    }

    get disableSpoolId() {
        return !this.useSpoolman || ['pull', 'off'].includes(this.spoolmanSupport)
    }

    get disableFilamentFields() {
        return this.useSpoolman || this.spoolmanSupport === 'pull'
    }

    get hideSpoolmanSwitch() {
        return ['pull', 'off'].includes(this.spoolmanSupport)
    }

    get filamentName() {
        return this.mmu?.gate_filament_name[this.selectedGate] ?? this.$t('Panels.MmuPanel.Unknown')
    }

    set filamentName(newName: unknown) {
        const value = String(newName ?? 'Unknown').replace(/["']/g, '')
        this.setMmuGateMap('name', value)
    }

    get filamentMaterial() {
        return this.mmu?.gate_material[this.selectedGate] ?? this.$t('Panels.MmuPanel.Unknown')
    }

    set filamentMaterial(newValue: unknown) {
        const value = String(newValue ?? 'Unknown').replace(/["']/g, '')
        this.setMmuGateMap('material', value)
    }

    get filamentTemperature() {
        return this.mmu?.gate_temperature[this.selectedGate] ?? 0
    }

    set filamentTemperature(newValue: number) {
        const isValid = this.temperatureRules.every((rule) => rule(newValue) === true)
        if (!isValid) return

        this.setMmuGateMap('temp', newValue)
    }

    get temperatureRules() {
        return [
            (v: string | number) => {
                const num = parseFloat(String(v))
                return !isNaN(num) && num >= this.minExtruderTemp && num <= this.maxExtruderTemp
                    ? true
                    : this.$t('Panels.MmuPanel.GateMapDialog.BadTemperature')
            },
        ]
    }

    get filamentColor() {
        return this.formColorString(this.mmu?.gate_color[this.selectedGate] ?? null)
    }

    set filamentColor(newValue: string) {
        if (this.filamentColor.toUpperCase() === newValue.toUpperCase()) return

        this.setMmuGateMap('color', newValue.slice(1))
    }

    get gateStatus() {
        return this.mmu?.gate_status[this.selectedGate] ?? GATE_UNKNOWN
    }

    get gateStatusSwitch() {
        return this.gateStatus === GATE_AVAILABLE || this.gateStatus === GATE_AVAILABLE_FROM_BUFFER
    }

    set gateStatusSwitch(value: boolean) {
        this.setMmuGateMap('available', value ? GATE_AVAILABLE : GATE_EMPTY)
    }

    get gateStatusLabel() {
        switch (this.gateStatus) {
            case GATE_EMPTY:
                return this.$t('Panels.MmuPanel.GateMapDialog.FilamentEmpty')
            case GATE_UNKNOWN:
                return this.$t('Panels.MmuPanel.GateMapDialog.FilamentUnknown')
            default:
                return this.$t('Panels.MmuPanel.GateMapDialog.FilamentAvailable')
        }
    }

    get speedOverride() {
        return this.mmu?.gate_speed_override[this.selectedGate] ?? 100
    }

    set speedOverride(newValue: number) {
        const value = isNaN(newValue)
            ? 100
            : Math.min(Math.max(newValue, FILAMENT_SPEED_OVERRIDE_MIN), FILAMENT_SPEED_OVERRIDE_MAX)
        this.setMmuGateMap('speed', value)
    }

    get spoolmanSpool() {
        return this.spoolmanSpools.find((spool: ServerSpoolmanStateSpool) => spool.id === this.spoolId) ?? null
    }

    get spoolmanColor(): string {
        return `#${this.spoolmanSpool?.filament?.color_hex ?? '000'}`
    }

    get spoolmanRemainingWeight() {
        if (!this.spoolmanSpool) return '-'

        const remaining = this.spoolmanSpool.remaining_weight ?? 0
        return `${remaining.toFixed(0)}g`
    }

    get spoolmanTotalWeight() {
        if (!this.spoolmanSpool) return '-'

        const total = this.spoolmanSpool.initial_weight ?? this.spoolmanSpool.filament?.weight ?? 0
        if (total < 1000) {
            return `${total.toFixed(0)}g`
        }

        let totalRound = Math.round(total / 1000)
        if (totalRound !== total / 1000) {
            totalRound = Math.round(total / 100) / 10
        }

        return `${totalRound}kg`
    }

    get spoolmanLastUsed() {
        if (!this.spoolmanSpool) return '-'

        const last_used = this.spoolmanSpool.last_used ?? null
        if (!last_used) return this.$t('Panels.SpoolmanPanel.Never')

        const date = new Date(this.spoolmanSpool.last_used)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff <= 1000 * 60 * 60 * 24) return this.$t('Panels.SpoolmanPanel.Today')
        if (diff <= 1000 * 60 * 60 * 24 * 2) return this.$t('Panels.SpoolmanPanel.Yesterday')
        if (diff <= 1000 * 60 * 60 * 24 * 14) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            return this.$t('Panels.SpoolmanPanel.DaysAgo', { days })
        }

        return date.toLocaleDateString()
    }

    @Debounce(500)
    selectFilamentColor(newColor: VColorPickerColor) {
        this.filamentColor = newColor.hexa
    }

    selectSpoolmanSpool(newSpool: ServerSpoolmanStateSpool) {
        this.spoolId = newSpool.id
    }

    decrementSpeed() {
        this.speedOverride = Math.max(FILAMENT_SPEED_OVERRIDE_MIN, Math.round(this.speedOverride - 10))
    }

    incrementSpeed() {
        this.speedOverride = Math.min(FILAMENT_SPEED_OVERRIDE_MAX, Math.round(this.speedOverride + 10))
    }

    resetSpeed() {
        this.speedOverride = 100
    }

    resetSpoolId() {
        if (this.spoolId === -1) return

        this.setMmuGateMap('spoolid', -1)
    }

    @Debounce(500)
    setMmuGateMap(attribute: string, value: string | number) {
        const gcode = `MMU_GATE_MAP GATE=${this.selectedGate} ${attribute.toUpperCase()}=${value} QUIET=1`
        this.doSend(gcode)
    }
}
</script>

<style scoped>
.height-auto {
    height: auto !important;
}

.no-spool {
    opacity: 0.3;
}

._slider-input {
    min-width: 5.2rem;
    max-width: 5.2rem;
    margin-left: 12px;
}

._slider-input >>> .v-input__slot {
    min-height: 1rem !important;
}

._slider-input >>> .v-text-field__slot input {
    padding-top: 4px;
    padding-bottom: 4px;
}

._slider-input >>> .v-input__append-inner {
    margin: auto -5px auto 0 !important;
}
</style>
