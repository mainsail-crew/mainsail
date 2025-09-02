<template>
    <v-container class="unit-container">
        <div class="spool-row">
            <div v-for="(g, index) in unitGateRange" :key="'gate_' + g" class="gate" @click="selectGate(g)">
                <div :class="clipSpoolClass">
                    <v-menu
                        v-model="gateMenuVisible[g]"
                        :disabled="g === gate || !unitDetails(unitIndex).multiGear"
                        :close-on-content-click="false"
                        transition="slide-y-transition"
                        offset-y>
                        <template #activator="{ attrs: menuAttrs }">
                            <v-tooltip top :disabled="!!editGateMap" :open-delay="500" content-class="spool-tooltip">
                                <template #activator="{ on: tooltipOn, attrs: tooltipAttrs }">
                                    <div v-bind="{ ...menuAttrs, ...tooltipAttrs }" v-on="{ ...tooltipOn }">
                                        <mmu-spool
                                            :width="spoolWidth + 'px'"
                                            :class="spoolClass(g)"
                                            :gate-index="g"
                                            :edit-gate-map="editGateMap"
                                            :edit-gate-selected="editGateSelected" />
                                    </div>
                                </template>

                                <div
                                    v-for="(line, idx) in gateTooltip(g)"
                                    :key="idx"
                                    class="spool-tooltip-line"
                                    :class="idx === 0 ? 'spool-tooltip-title' : ''">
                                    {{ line }}
                                </div>
                            </v-tooltip>
                        </template>

                        <v-list dense>
                            <v-subheader class="compact-subheader">Gate {{ g }}</v-subheader>
                            <v-divider></v-divider>
                            <v-list-item>
                                <v-btn
                                    small
                                    style="width: 100%"
                                    :disabled="!canSend"
                                    :loading="loadings.includes('mmu_select')"
                                    @click="doLoadingSend('MMU_SELECT GATE=' + g, 'mmu_select')">
                                    <v-icon left>{{ mdiSwapHorizontal }}</v-icon>
                                    {{ $t('Panels.MmuPanel.ButtonSelect') }}
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn
                                    small
                                    style="width: 100%"
                                    :disabled="!canSend || ![GATE_UNKNOWN, GATE_EMPTY].includes(gateDetails(g).status)"
                                    :loading="loadings.includes('mmu_preload')"
                                    @click="doLoadingSend('MMU_PRELOAD GATE=' + g, 'mmu_preload')">
                                    <v-icon left>{{ mdiDownloadOutline }}</v-icon>
                                    {{ $t('Panels.MmuPanel.ButtonPreload') }}
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn
                                    small
                                    style="width: 100%"
                                    :disabled="!canSend"
                                    :loading="loadings.includes('mmu_eject')"
                                    @click="doLoadingSend('MMU_EJECT GATE=' + g, 'mmu_eject')">
                                    <v-icon left>{{ mdiEject }}</v-icon>
                                    {{ $t('Panels.MmuPanel.ButtonEject') }}
                                </v-btn>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <div
                        v-if="(editGateMap && editGateSelected === g) || (!editGateMap && gate === g)"
                        style="position: absolute; bottom: 0%; left: 0%; width: 100%; height: auto; background: none">
                        <mmu-spool-clip />
                    </div>
                </div>
                <mmu-gate-status
                    :class="gateStatusClass(index)"
                    :gate-index="g"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />
            </div>

            <div v-if="showBypass" class="gate" @click="selectBypass()">
                <div :class="clipSpoolClass">
                    <mmu-spool
                        :width="spoolWidth + 'px'"
                        :class="spoolClass(TOOL_GATE_BYPASS)"
                        :gate-index="TOOL_GATE_BYPASS"
                        :edit-gate-map="editGateMap"
                        :edit-gate-selected="editGateSelected" />
                    <div
                        v-if="gate === TOOL_GATE_BYPASS"
                        style="position: absolute; bottom: 0%; left: 0%; width: 100%; height: auto; background: none">
                        <mmu-spool-clip />
                    </div>
                </div>
                <mmu-gate-status
                    :class="gateStatusClass(TOOL_GATE_BYPASS)"
                    :gate-index="TOOL_GATE_BYPASS"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />
            </div>
        </div>

        <div class="logo-row" :style="'max-width: ' + logoRowWidth + 'px;'">
            <div
                v-if="showLogos && svgLogo"
                class="mmu-logo"
                :style="'height: ' + logoHeight + 'px;'"
                v-html="svgLogo"></div>
            <div class="unit-info">
                <div class="unit-name">
                    <span v-if="showName">{{ unitDisplayName }}</span>
                </div>
                <div v-if="unitClimateInfo" class="unit-climate">{{ unitClimateInfo }}</div>
            </div>
        </div>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import type { MmuGateDetails } from '@/store/mmu/types'
import MmuSpool from '@/components/panels/Mmu/MmuSpool.vue'
import MmuSpoolClip from '@/components/panels/Mmu/MmuSpoolClip.vue'
import MmuGateStatus from '@/components/panels/Mmu/MmuGateStatus.vue'
import { mdiSwapHorizontal, mdiDownloadOutline, mdiEject } from '@mdi/js'
import { additionalSensors } from '@/store/variables'

@Component({
    components: { MmuSpool, MmuSpoolClip, MmuGateStatus },
})
export default class MmuUnit extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: false, default: 0 }) readonly unitIndex!: number
    @Prop({ required: false, default: null }) readonly editGateMap!: MmuGateDetails[] | null
    @Prop({ required: false, default: -1 }) readonly editGateSelected!: number

    mdiSwapHorizontal = mdiSwapHorizontal
    mdiDownloadOutline = mdiDownloadOutline
    mdiEject = mdiEject

    gateMenuVisible: Record<number, boolean> = {}
    gateMenuTimer: ReturnType<typeof setTimeout> | null = null

    private svgLogo = null as string | null

    get unitDisplayName(): string {
        const name = this.unitDetails(this.unitIndex).name
        return `#${this.unitIndex + 1} ${name}`
    }

    get unitClimateInfo(): string {
        const unit = this.unitDetails(this.unitIndex)

        // Handle missing or quoted sensor name
        const sensorName = unit.environmentSensor?.replace(/^"(.*)"$/, '$1')
        if (!sensorName) return ''

        // Then find raw printer object so we can get environment data
        const parts = sensorName.split(' ')
        const matchingKey = additionalSensors.find((name) => {
            const objectName = `${name} ${parts[1]}`
            return objectName in this.$store.state.printer
        })
        const sensor = matchingKey ? this.$store.state.printer[`${matchingKey} ${parts[1]}`] : undefined

        if (!sensor) return ''
        const values: string[] = []

        if (sensor.temperature != null) {
            values.push(`${sensor.temperature.toFixed(0)}°C`)
        }

        if (sensor.humidity != null) {
            values.push(`${sensor.humidity.toFixed(0)}%`)
        }

        return values.join(' / ')
    }

    get unitGateRange(): number[] {
        const unitDetails = this.unitDetails(this.unitIndex)
        return Array.from({ length: unitDetails.numGates }, (v, k) => k + unitDetails.firstGate)
    }

    get spoolWidth(): number {
        if (this.numGates <= 8) {
            return 56
        } else if (this.numGates <= 16) {
            return 48
        }
        return 40
    }

    get logoRowWidth(): number {
        return this.spoolWidth * (this.unitGateRange.length + (this.showBypass ? 1 : 0))
    }

    get clipSpoolClass(): string[] {
        const classes = ['clip-spool']
        if (this.numGates <= 8) {
            classes.push('clip-large')
        } else if (this.numGates <= 16) {
            classes.push('clip-medium')
        } else {
            classes.push('clip-small')
        }
        return classes
    }

    get logoHeight(): number {
        return this.spoolWidth - 8
    }

    get showLogos(): boolean {
        return this.$store.state.gui.view.mmu.showLogos
    }

    get showName(): boolean {
        return this.$store.state.gui.view.mmu.showName
    }

    get showBypass(): boolean {
        return !this.editGateMap && this.unitDetails(this.unitIndex).hasBypass && this.hasBypass
    }

    gateTooltip(gate: number): string[] {
        const details = this.gateDetails(gate)
        if (details.status === this.GATE_EMPTY) {
            return [this.$t('Panels.MmuPanel.ToolTip.Empty').toString()]
        }
        const ret = []
        ret.push(details.filamentName)

        const tempStr = details.temperature > 0 ? ' | ' + details.temperature + '°C' : ''
        ret.push(details.material + tempStr)

        if (details.color && details.color !== '#808182E3') {
            const color = details.color
            ret.push(
                this.$t('Panels.MmuPanel.ToolTip.Color').toString() +
                    ': ' +
                    color.substring(0, 7) +
                    (color.length > 7 && color.substring(7, 9) !== 'FF' ? color.substring(7, 9) : '')
            )
        }
        if (details.spoolId && details.spoolId > 0) {
            ret.push(this.$t('Panels.MmuPanel.ToolTip.SpoolId').toString() + ': ' + details.spoolId)
        }
        return ret
    }

    gateStatusClass(gate: number): string[] {
        const firstGate = gate === 0
        const lastGate = (gate === this.unitGateRange.length - 1 && !this.showBypass) || gate === this.TOOL_GATE_BYPASS
        let classes = ['gate-status-row']
        if (firstGate) classes.push('first-gate')
        if (lastGate) classes.push('last-gate')
        classes.push(this.$vuetify.theme.dark ? 'gate-status-row-dark-theme' : 'gate-status-row-light-theme')
        return classes
    }

    spoolClass(gate: number): string[] {
        const classes = []
        if ((this.editGateMap && this.editGateSelected === gate) || (!this.editGateMap && this.gate === gate)) {
            classes.push('highlight-spool')
        } else {
            if (!this.isMobileViewport) classes.push('hover-effect')
            if (this.editGateMap) {
                classes.push('unhighlight-spool')
            }
        }
        return classes
    }

    selectGate(gate: number) {
        if (this.editGateMap) {
            this.$emit('select-gate', gate)
        } else if (!this.isPrinting) {
            if (
                this.unitDetails(this.unitIndex).multiGear &&
                gate !== this.gate &&
                ![this.FILAMENT_POS_UNLOADED, this.FILAMENT_POS_UNKNOWN].includes(this.filamentPos)
            ) {
                if (this.gateMenuTimer) clearTimeout(this.gateMenuTimer)
                this.gateMenuTimer = setTimeout(() => {
                    Object.keys(this.gateMenuVisible).forEach((key) => {
                        this.$set(this.gateMenuVisible, Number(key), false)
                    })
                }, 3000)
                this.$set(this.gateMenuVisible, gate, true)
            } else {
                if (this.gateMenuTimer) clearTimeout(this.gateMenuTimer)
                this.doSend('MMU_SELECT GATE=' + gate)
            }
        }
    }

    selectBypass() {
        if (this.editGateMap) {
            this.$emit('select-gate', this.TOOL_GATE_BYPASS)
        } else if (!this.isPrinting) {
            this.doSend('MMU_SELECT BYPASS=1')
        }
    }

    mounted() {
        const unitVendor = this.unitDetails(this.unitIndex).vendor
        const svgLogoUrl = '/img/mmu/mmu_' + unitVendor + '.svg'
        this.fetchSvg(svgLogoUrl)
    }

    async fetchSvg(url: string) {
        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch vendor specific MMU logo')
                }
                return res.text()
            })
            .then((svg) => {
                if (!svg.includes('<svg')) throw new Error('Not an svg logo')
                this.svgLogo = svg
            })
            .catch(() => {
                const defaultUrl = '/img/mmu/mmu_HappyHare.svg'
                fetch(defaultUrl)
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error('Failed to fetch the default MMU logo')
                        }
                        return res.text()
                    })
                    .then((svg) => {
                        this.svgLogo = svg
                    })
                    .catch(() => {
                        this.svgLogo = null
                    })
            })
    }
}
</script>

<style scoped>
.unit-container {
    padding: 0;
}

.spool-tooltip {
    max-width: 180px;
    font-size: 12px;
    line-height: 1.2em;
    padding: 4px 8px;
}

.spool-tooltip-title {
    font-weight: bold;
}

.spool-tooltip-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.spool-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    padding: 8px 0px 0px 0px;
    gap: 0px;
}

.gate-status-row {
    padding-top: 4px;
    padding-bottom: 8px;
    position: relative;
    z-index: 1;
}

.logo-row {
    display: flex;
}

.mmu-logo {
    padding: 4px 12px 8px 0px;
    fill: currentColor;
    stroke: currentColor;
    opacity: 0.7;
}

.unit-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
}

.unit-name {
    display: flex;
    align-items: flex-end;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    padding: 4px 0 0 0;
}

.unit-climate {
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-align: right;
    padding: 0px;
    opacity: 0.8;
}

.gate-status-row-dark-theme {
    box-shadow: inset 0px 4px 4px -4px #ffffff80;
    background-image: linear-gradient(to bottom, #3c3c3c 0%, #2c2c2c 100%);
}

.gate-status-row-light-theme {
    box-shadow: inset 0px 4px 4px -4px #ffffff80;
    background-image: linear-gradient(to bottom, #d0d0d0 0%, #f0f0f0ff 100%);
}

.first-gate {
    border-radius: 8px 0 0px 10px;
    margin-left: -16px;
    padding-left: 16px;
}

.last-gate {
    border-radius: 0 8px 10px 0px;
    margin-right: -16px;
    padding-right: 16px;
}

.first-gate.last-gate {
    border-radius: 8px 8px 10px 10px;
}

.clip-spool {
    position: relative;
    margin-top: 8px;
}

.clip-small {
    max-height: 73px;
}

.clip-medium {
    max-height: 88px;
}

.clip-large {
    max-height: 100px;
}

.gate {
    font-size: 0px;
    border-radius: 12px;
    line-height: 1em;
    cursor: pointer;
}

.highlight-spool {
    transform: translateY(-8px);
    opacity: 1;
}

.unhighlight-spool {
    opacity: 0.4;
}

.hover-effect {
    transition: transform 0.2s ease-in-out;
}

.hover-effect:hover {
    transform: translateY(-5px);
    opacity: 1;
}

.v-list--dense .compact-subheader {
    height: auto;
    padding-bottom: 4px;
    display: block;
    text-align: center;
}
</style>
