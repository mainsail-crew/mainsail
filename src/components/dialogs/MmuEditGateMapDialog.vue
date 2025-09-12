<template>
    <v-dialog v-model="showDialog" width="800" persistent :fullscreen="isMobile">
        <panel
            :title="$t('Panels.MmuPanel.EditGateMapTitle')"
            :icon="mdiDatabaseEdit"
            card-class="mmu-edit-ttg-map-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="close">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <!-- UPPER SECTION -->
            <v-card-subtitle v-if="editGateMap.length > 0">
                <v-container fluid>
                    <!-- HEADER -->
                    <v-row>
                        <v-col cols="8" class="d-flex justify-start align-center pa-0">
                            {{ $t('Panels.MmuPanel.GateMapDialog.SelectGate') }}
                        </v-col>
                        <v-col cols="4" class="d-flex justify-end pa-0">
                            <v-btn
                                small
                                color="secondary"
                                class="small-font"
                                :loading="loadings.includes('mmu_ttg_map')"
                                @click="resetGateMap()">
                                {{ $t('Panels.MmuPanel.GateMapDialog.Reset') }}
                            </v-btn>
                        </v-col>
                    </v-row>

                    <!-- DISPLAY GATES -->
                    <v-row align="start">
                        <v-col class="d-flex justify-start align-center pa-0">
                            <mmu-machine
                                :edit-gate-map="editGateMap"
                                :edit-gate-selected="editGateSelected"
                                @select-gate="selectGate" />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-subtitle>

            <v-divider />

            <!-- LOWER SECTION -->
            <v-card-text class="px-4 pb-4">
                <div class="fixed-area">
                    <transition name="fade">
                        <div v-if="editGateSelected === TOOL_GATE_UNKNOWN" class="overlay-text">
                            {{ $t('Panels.MmuPanel.GateMapDialog.SelectGate') }}
                        </div>
                    </transition>

                    <transition name="fade">
                        <v-container v-if="editGateSelected !== TOOL_GATE_UNKNOWN">
                            <v-row class="ms-0 me-0 mb-4">
                                <v-col class="d-flex justify-start align-center pa-0 small-font text--secondary">
                                    <div v-if="spoolmanSupport === SPOOLMAN_PULL">
                                        {{
                                            $t('Panels.MmuPanel.GateMapDialog.SpoolmanPull', {
                                                mode: spoolmanSupport,
                                            })
                                        }}
                                    </div>
                                    <div v-else-if="spoolmanSupport === SPOOLMAN_OFF">
                                        {{
                                            $t('Panels.MmuPanel.GateMapDialog.SpoolmanOff', {
                                                mode: spoolmanSupport,
                                            })
                                        }}
                                    </div>
                                    <div v-else>
                                        {{
                                            $t('Panels.MmuPanel.GateMapDialog.SpoolmanOther', {
                                                mode: spoolmanSupport,
                                            })
                                        }}
                                    </div>
                                </v-col>
                            </v-row>

                            <!-- GATE DETAILS-->
                            <v-row>
                                <v-col cols="12" md="6" class="d-flex flex-column justify-start align-left pa-0 pt-3">
                                    <v-row>
                                        <v-col cols="6" class="pt-5 ps-6">
                                            <v-switch
                                                v-model="useSpoolman"
                                                :label="$t('Panels.MmuPanel.GateMapDialog.Spoolman')"
                                                :disabled="
                                                    spoolmanSupport === SPOOLMAN_PULL ||
                                                    spoolmanSupport === SPOOLMAN_OFF
                                                "
                                                hide-details
                                                class="short-switch" />
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field
                                                v-model="spoolId"
                                                type="number"
                                                :label="$t('Panels.MmuPanel.GateMapDialog.SpoolmanId')"
                                                :rules="spoolIdRules()"
                                                :disabled="disableSpoolId()"
                                                :hide-spin-buttons="disableSpoolId()"
                                                outlined
                                                dense
                                                @blur="adjustSpoolId" />
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col cols="12" class="ps-6">
                                            <v-text-field
                                                v-model.trim="editGateSelectedDetails.filamentName"
                                                :label="$t('Panels.MmuPanel.GateMapDialog.FilamentName')"
                                                :disabled="useSpoolman || spoolmanSupport === SPOOLMAN_PULL"
                                                outlined
                                                dense
                                                clearable
                                                hide-details
                                                @blur="adjustName" />
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col cols="6" class="ps-6">
                                            <v-text-field
                                                v-model.trim="editGateSelectedDetails.material"
                                                :label="$t('Panels.MmuPanel.GateMapDialog.Material')"
                                                :disabled="useSpoolman || spoolmanSupport === SPOOLMAN_PULL"
                                                outlined
                                                dense
                                                clearable
                                                hide-details
                                                @blur="adjustMaterial" />
                                        </v-col>
                                        <v-col cols="2"></v-col>
                                        <v-col cols="4">
                                            <v-text-field
                                                v-model="editGateSelectedDetails.temperature"
                                                type="number"
                                                :label="$t('Panels.MmuPanel.GateMapDialog.Temperature')"
                                                :disabled="useSpoolman || spoolmanSupport === SPOOLMAN_PULL"
                                                :hide-spin-buttons="useSpoolman || spoolmanSupport === SPOOLMAN_PULL"
                                                suffix="°C"
                                                :rules="temperatureRules()"
                                                outlined
                                                dense
                                                hide-details
                                                @blur="adjustTemperature" />
                                        </v-col>
                                    </v-row>

                                    <v-row class="pt-3 pb-3 ps-3">
                                        <v-divider />
                                    </v-row>

                                    <v-row>
                                        <v-col cols="12" class="ps-6">
                                            <v-switch
                                                v-model="selectedGateStatus"
                                                :label="selectedGateStatusLabel"
                                                hide-details
                                                class="short-switch" />
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-col cols="12">
                                            <v-subheader class="speed-slider-subheader ps-6 pe-1">
                                                <v-icon small class="mr-2">{{ mdiSpeedometer }}</v-icon>
                                                <span>{{ $t('Panels.MmuPanel.GateMapDialog.LoadSpeed') }}</span>
                                                <v-spacer></v-spacer>
                                                <v-text-field
                                                    v-model="editGateSelectedDetails.speedOverride"
                                                    type="number"
                                                    suffix="%"
                                                    hide-spin-buttons
                                                    hide-details
                                                    outlined
                                                    dense
                                                    readonly
                                                    class="_slider-input d-flex align-center pt-1">
                                                    <template #append>
                                                        <v-icon small @click="resetSpeed">{{ mdiRestart }}</v-icon>
                                                    </template>
                                                </v-text-field>
                                            </v-subheader>

                                            <v-card-text class="pb-0 pe-0 pt-1 d-flex align-center">
                                                <v-slider
                                                    v-model="editGateSelectedDetails.speedOverride"
                                                    :min="10"
                                                    :max="150"
                                                    hide-details>
                                                    <template #prepend>
                                                        <v-icon @click="decrementSpeed">{{ mdiMinus }}</v-icon>
                                                    </template>
                                                    <template #append>
                                                        <v-icon @click="incrementSpeed">{{ mdiPlus }}</v-icon>
                                                    </template>
                                                </v-slider>
                                            </v-card-text>
                                        </v-col>
                                    </v-row>

                                    <v-row>
                                        <v-spacer />
                                    </v-row>
                                </v-col>

                                <v-col cols="12" md="6" class="d-flex justify-center">
                                    <div v-if="!useSpoolman">
                                        <v-color-picker
                                            v-model="editGateSelectedDetails.color"
                                            hide-inputs
                                            swatches-max-height="120px"
                                            show-swatches
                                            mode="hexa"
                                            show-alpha
                                            hide-opacity="false" />
                                    </div>
                                    <div v-else>
                                        <div :class="!spoolIdExists ? 'no-spool' : ''">
                                            <spool-icon
                                                height="120px"
                                                width="100%"
                                                :color="spoolmanColor"
                                                @click-spool="showSpoolmanSpoolChooserDialog = true" />
                                            <div class="pt-4">{{ spoolmanLastUsed }}</div>
                                            <div>
                                                <strong>{{ spoolmanRemainingWeight }}</strong>
                                                <small class="ml-1">/ {{ spoolmanTotalWeight }}</small>
                                            </div>
                                        </div>
                                        <div style="padding-top: 12px">
                                            <v-btn
                                                block
                                                color="secondary"
                                                class="spoolman-btn"
                                                @click="showSpoolmanSpoolChooserDialog = true">
                                                <v-icon>{{ mdiAdjust }}</v-icon>
                                                {{ $t('Panels.MmuPanel.GateMapDialog.ChooseSpool') }}
                                            </v-btn>
                                        </div>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-container>
                    </transition>
                </div>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn text @click="close">{{ $t('Panels.MmuPanel.Cancel') }}</v-btn>
                <v-btn color="primary" text @click="commit">{{ $t('Panels.MmuPanel.Save') }}</v-btn>
            </v-card-actions>
        </panel>

        <!-- SPOOLMAN (ADAPTED) SPOOL SELECTOR -->
        <spoolman-change-spool-dialog
            :show-dialog="showSpoolmanSpoolChooserDialog"
            :set-active-spool="false"
            @select-spool="selectSpoolmanSpool"
            @close="showSpoolmanSpoolChooserDialog = false" />

        <!-- CONFIRMATION FOR RESET ACTION -->
        <confirmation-dialog
            :show="showResetConfirmationDialog"
            :title="$t('Panels.MmuPanel.Dialog.AreYouSure')"
            :text="$t('Panels.MmuPanel.GateMapDialog.ResetConfirmation')"
            :action-button-text="$t('Panels.MmuPanel.GateMapDialog.Reset')"
            :cancel-button-text="$t('Panels.MmuPanel.Cancel')"
            @action="executeResetGateMap"
            @close="showResetConfirmationDialog = false" />
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import Panel from '@/components/ui/Panel.vue'
import type { MmuGateDetails } from '@/store/mmu/types'
import type { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import SpoolmanChangeSpoolDialog from '@/components/dialogs/SpoolmanChangeSpoolDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import MmuMachine from '@/components/panels/Mmu/MmuMachine.vue'
import { mdiCloseThick, mdiDatabaseEdit, mdiSpeedometer, mdiRestart, mdiMinus, mdiPlus, mdiAdjust } from '@mdi/js'

@Component({
    components: { Panel, MmuMachine, ConfirmationDialog, SpoolmanChangeSpoolDialog },
})
export default class MmuEditGateMapDialog extends Mixins(BaseMixin, MmuMixin) {
    mdiCloseThick = mdiCloseThick
    mdiDatabaseEdit = mdiDatabaseEdit
    mdiSpeedometer = mdiSpeedometer
    mdiRestart = mdiRestart
    mdiMinus = mdiMinus
    mdiPlus = mdiPlus
    mdiAdjust = mdiAdjust

    @Prop({ required: true }) declare readonly showDialog: boolean

    // Gate being edited
    get editGateSelected(): number {
        return this.$store.getters['mmuGateMapEditor/selectedGate']
    }

    // Details of gate being edited
    get editGateSelectedDetails(): MmuGateDetails {
        const g = this.$store.getters['mmuGateMapEditor/selectedGateDetails']
        return g ? g : this.gateDetails(this.TOOL_GATE_UNKNOWN)
    }

    // Whole gate map
    get editGateMap(): MmuGateDetails[] {
        return this.$store.getters['mmuGateMapEditor/gateMap']
    }

    private showResetConfirmationDialog: boolean = false
    private showSpoolmanSpoolChooserDialog: boolean = false

    @Watch('showDialog')
    onShowDialogChanged() {
        this.initialize()
    }

    @Watch('gateMap')
    onGateMapChanged() {
        this.initialize()
    }

    private initialize() {
        if (this.showDialog) {
            this.refreshSpoolmanData()
            this.$store.dispatch('mmuGateMapEditor/init', {
                gateMap: Array.from(this.gateMap),
                selected: this.TOOL_GATE_UNKNOWN,
            })
        } else {
            this.$store.commit('mmuGateMapEditor/clearMap')
            this.$store.commit('mmuGateMapEditor/setSelectedGate', this.TOOL_GATE_UNKNOWN)
        }
        this.min_extruder_temp = this.$store.state.printer.configfile.config.extruder?.min_temp ?? 90
        this.max_extruder_temp = this.$store.state.printer.configfile.config.extruder?.max_temp ?? 290
    }

    private selectGate(gate: number) {
        if (this.editGateSelected !== this.TOOL_GATE_UNKNOWN) this.adjustSpoolId()

        const willSelect = this.editGateSelected !== gate
        this.$store.commit('mmuGateMapEditor/setSelectedGate', willSelect ? gate : this.TOOL_GATE_UNKNOWN)

        // Clean up stale spool_id's
        if (willSelect && this.spoolmanSupport === this.SPOOLMAN_OFF) {
            this.$store.commit('mmuGateMapEditor/patchGate', { spoolId: -1 })
        }
    }

    private handleEscapePress(event: KeyboardEvent) {
        if (event.key === 'Escape' || event.code === 'Escape') {
            this.$store.commit('mmuGateMapEditor/setSelectedGate', this.TOOL_GATE_UNKNOWN)
        }
    }

    private adjustName() {
        const filamentName = (this.editGateSelectedDetails?.filamentName ?? '').trim().replace(/[#'"]/g, '')
        this.$store.commit('mmuGateMapEditor/patchGate', { filamentName })
    }

    private adjustMaterial() {
        const material = (this.editGateSelectedDetails?.material ?? '').trim().replace(/[#'"]/g, '')
        this.$store.commit('mmuGateMapEditor/patchGate', { material })
    }

    get spoolId(): number | null {
        return this.editGateSelectedDetails?.spoolId ?? null
    }

    set spoolId(newSpoolIdStr: string | null) {
        const newSpoolId = newSpoolIdStr ? parseInt(newSpoolIdStr) : null
        const spoolId = newSpoolId !== null && !isNaN(newSpoolId) ? newSpoolId : null
        this.$store.commit('mmuGateMapEditor/patchGate', { spoolId })
    }

    private selectSpoolmanSpool(spool: ServerSpoolmanStateSpool) {
        this.$store.commit('mmuGateMapEditor/patchGate', { spoolId: spool.id })
    }

    @Watch('spoolId')
    onSpoolIdChanged(newSpoolId: number | null) {
        if (newSpoolId !== null && newSpoolId > 0) {
            const spool = this.spoolmanSpool(newSpoolId)
            const filamentName = spool?.filament?.name ?? this.$t('Panels.MmuPanel.Unknown')
            const material = spool?.filament?.material ?? this.$t('Panels.MmuPanel.Unknown')
            const color = this.formColorString(spool?.filament?.color_hex)
            const temperature = spool?.filament?.settings_extruder_temp ?? -1
            this.$store.commit('mmuGateMapEditor/patchGate', { filamentName, material, color, temperature })
        }
    }

    private spoolIdRules() {
        const spools: ServerSpoolmanStateSpool[] = this.$store.state.server.spoolman?.spools ?? []
        return [
            (v: number) => {
                if (!v || v <= 0) return true
                const spoolExists = spools.some((spool) => spool.id === v) ?? null
                return spoolExists ? true : this.$t('Panels.MmuPanel.GateMapDialog.NoMatchingSpool')
            },
        ]
    }

    private disableSpoolId() {
        return (
            !this.useSpoolman ||
            this.spoolmanSupport === this.SPOOLMAN_PULL ||
            this.spoolmanSupport === this.SPOOLMAN_OFF
        )
    }

    private adjustSpoolId() {
        const spoolId = this.editGateSelectedDetails?.spoolId ?? -1
        this.$store.commit('mmuGateMapEditor/patchGate', { spoolId })
    }

    get spoolIdExists(): boolean {
        const spools: ServerSpoolmanStateSpool[] = this.$store.state.server.spoolman?.spools ?? []
        return spools.some((spool) => spool.id === this.spoolId)
    }

    get temperature(): number {
        return this.editGateSelectedDetails?.temperature ?? -1
    }

    set temperature(newTemperatureStr: string) {
        const newTemperature = newTemperatureStr ? parseInt(newTemperatureStr) : -1
        this.$store.commit('mmuGateMapEditor/patchGate', { temperature: isNaN(newTemperature) ? -1 : newTemperature })
    }

    private temperatureRules() {
        return [
            (v: string | number) => {
                const num = parseFloat(String(v))
                return !isNaN(num) && num >= this.min_extruder_temp && num <= this.max_extruder_temp
                    ? true
                    : this.$t('Panels.MmuPanel.GateMapDialog.BadTemperature')
            },
        ]
    }

    private adjustTemperature() {
        const temp = this.temperature
        if (temp < this.min_extruder_temp) {
            this.$store.commit('mmuGateMapEditor/patchGate', { temperature: this.min_extruder_temp })
        } else if (temp > this.max_extrduer_temp) {
            this.$store.commit('mmuGateMapEditor/patchGate', { temperature: this.max_extruder_temp })
        }
    }

    get useSpoolman(): boolean {
        const spoolId = this.editGateSelectedDetails?.spoolId
        return spoolId === null || (typeof spoolId === 'number' && spoolId > 0)
    }

    set useSpoolman(newValue: boolean) {
        this.$store.commit('mmuGateMapEditor/patchGate', { spoolId: newValue ? null : -1 })
    }

    get selectedGateStatus(): boolean {
        const g = this.editGateSelectedDetails
        return g ? g.status === this.GATE_AVAILABLE || g.status === this.GATE_AVAILABLE_FROM_BUFFER : false
    }

    set selectedGateStatus(value: boolean) {
        this.$store.commit('mmuGateMapEditor/patchGate', { status: value ? this.GATE_AVAILABLE : this.GATE_EMPTY })
    }

    get selectedGateStatusLabel(): string {
        const status = this.editGateSelectedDetails?.status
        if (status === this.GATE_UNKNOWN) {
            return this.$t('Panels.MmuPanel.GateMapDialog.FilamentUnknown').toString()
        } else if (status === this.GATE_EMPTY) {
            return this.$t('Panels.MmuPanel.GateMapDialog.FilamentEmpty').toString()
        }
        return this.$t('Panels.MmuPanel.GateMapDialog.FilamentAvailable').toString()
    }

    get spoolmanColor(): string {
        const spoolId = this.editGateSelectedDetails?.spoolId ?? -1
        const spool = this.spoolmanSpool(spoolId)
        const color = spool?.filament.color_hex ?? '000'
        return `#${color}`
    }

    get spoolmanRemainingWeight() {
        const spoolId = this.editGateSelectedDetails?.spoolId ?? -1
        const spool = this.spoolmanSpool(spoolId)
        if (spool) {
            const remaining = spool.remaining_weight ?? 0
            return `${remaining.toFixed(0)}g`
        }
        return '-'
    }

    get spoolmanTotalWeight() {
        const spoolId = this.editGateSelectedDetails?.spoolId ?? -1
        const spool = this.spoolmanSpool(spoolId)
        if (spool) {
            // Technically this is what spoolman implements but not available in Fluidd:
            //   let total = spool.initial_weight ?? spool.filament?.weight ?? 0
            let total = spool.filament?.weight ?? 0
            if (total < 1000) {
                return `${total.toFixed(0)}g`
            }

            let totalRound = Math.round(total / 1000)
            if (totalRound !== total / 1000) {
                totalRound = Math.round(total / 100) / 10
            }
            return `${totalRound}kg`
        }
        return '-'
    }

    get spoolmanLastUsed() {
        const spoolId = this.editGateSelectedDetails?.spoolId ?? -1
        const spool = this.spoolmanSpool(spoolId)
        let usedStr = '-'

        if (spool) {
            const last_used = spool.last_used ?? null
            if (!last_used) {
                usedStr = this.$t('Panels.SpoolmanPanel.Never')
            } else {
                const date = new Date(spool.last_used)
                const now = new Date()
                const diff = now.getTime() - date.getTime()

                if (diff <= 1000 * 60 * 60 * 24) return this.$t('Panels.SpoolmanPanel.Today')
                if (diff <= 1000 * 60 * 60 * 24 * 2) return this.$t('Panels.SpoolmanPanel.Yesterday')
                if (diff <= 1000 * 60 * 60 * 24 * 14) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                    usedStr = this.$t('Panels.SpoolmanPanel.DaysAgo', { days })
                }
                usedStr = date.toLocaleDateString()
            }
        }
        return `${this.$t('Panels.SpoolmanPanel.LastUsed')}: ${usedStr}`
    }

    decrementSpeed(): void {
        this.$store.commit('mmuGateMapEditor/decrementSpeed')
    }

    incrementSpeed(): void {
        this.$store.commit('mmuGateMapEditor/incrementSpeed')
    }

    private resetSpeed(): void {
        this.$store.commit('mmuGateMapEditor/resetSpeed')
    }

    // Actions...

    resetGateMap() {
        this.showResetConfirmationDialog = true
    }

    executeResetGateMap() {
        this.initialize()
        this.doLoadingSend('MMU_GATE_MAP RESET=1', 'mmu_gate_map')
        this.showResetConfirmationDialog = false
    }

    close() {
        this.$store.commit('mmuGateMapEditor/clearMap')
        this.$store.commit('mmuGateMapEditor/setSelectedGate', this.TOOL_GATE_UNKNOWN)
        this.$emit('close')
    }

    commit() {
        if (this.editGateSelected !== this.TOOL_GATE_UNKNOWN) this.adjustSpoolId() // Get rid of null possibility
        const mapStr = this.generateMapString(this.editGateMap)
        const cmd = `MMU_GATE_MAP MAP="${mapStr}" QUIET=1`
        this.doSend(cmd)
        this.close()
    }

    private generateMapString(gateMap: MmuGateDetails[]) {
        type GateDetails = {
            status: number
            spool_id: number | null
            material: string
            color: string
            name: string
            temp: number
            speed_override: number
        }
        const mapObject: Record<number, GateDetails> = {}
        gateMap.forEach((gate) => {
            mapObject[gate.index] = {
                status: gate.status ?? this.GATE_UNKNOWN,
                spool_id: gate.spoolId ?? -1,
                material: gate.material ?? '',
                color: gate.color.replace(this.NO_FILAMENT_COLOR, '').replace('#', ''),
                name: gate.filamentName ?? '',
                temp: gate.temperature ?? -1,
                speed_override: gate.speedOverride ?? 100,
            }
        })
        const jsonString = JSON.stringify(mapObject)
            .replace(/"(\d+)":/g, '$1: ')
            .replace(/"/g, "'")
        return jsonString
    }

    mounted() {
        document.addEventListener('keydown', this.handleEscapePress)
    }

    beforeDestroy() {
        document.removeEventListener('keydown', this.handleEscapePress)
    }
}
</script>

<style scoped>
.small-font {
    font-size: 0.8em;
}

.no-spool {
    opacity: 0.3;
}

.fixed-area {
    min-height: 420px;
    position: relative;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.overlay-text {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.short-switch {
    padding-top: 0px;
    margin-top: 0px;
    margin-bottom: 2px;
}

.speed-slider-subheader {
    height: auto;
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

.spoolman-btn {
    width: 160px;
    overflow: hidden;
    font-size: 0.8em;
}
.spoolman-btn .v-icon {
    margin-right: 4px;
}
</style>
