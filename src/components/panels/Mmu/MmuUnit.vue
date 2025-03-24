<template>
    <v-container class="unit-container">
        <div class="spool-row">
            <div v-for="(gate, index) in unitGateRange" :key="'gate_' + gate" class="gate" @click="selectGate(gate)">
                <div :class="clipSpoolClass">
                    <v-tooltip top>
                        <template #activator="{ on, attrs }">
                            <div v-bind="attrs" v-on="on">
                                <mmu-spool
                                    :width="spoolWidth + 'px'"
                                    :class="spoolClass(gate)"
                                    :gate-index="gate"
                                    :edit-gate-map="editGateMap"
                                    :edit-gate-selected="editGateSelected" />
                            </div>
                        </template>
                        <span>
                            <div v-for="(line, idx) in gateTooltip(gate)" :key="idx">
                                {{ line }}
                            </div>
                        </span>
                    </v-tooltip>
                    <div
                        v-if="editGateMap && editGateSelected === gate"
                        style="position: absolute; bottom: 0%; left: 0%; width: 100%; height: auto; background: none">
                        <svg width="100%" height="100%" viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <clipPath id="clip-half">
                                    <rect x="0" y="0" width="80" height="60" />
                                </clipPath>
                                <radialGradient id="spotlight" cx="50%" cy="70%" r="50%" fx="50%" fy="100%">
                                    <stop offset="0%" style="stop-color: rgba(255, 255, 255, 0.9); stop-opacity: 1" />
                                    <stop offset="100%" style="stop-color: rgba(255, 255, 0, 0); stop-opacity: 0" />
                                </radialGradient>
                            </defs>
                            <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill="url(#spotlight)"
                                clip-path="url(#clip-half)" />
                        </svg>
                    </div>
                </div>
                <mmu-gate-status
                    :class="gateStatusClass(index)"
                    :gate-index="gate"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />
            </div>

            <div v-if="showBypass" class="gate" @click="selectBypass()">
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <div :class="clipSpoolClass" v-bind="attrs" v-on="on">
                            <mmu-spool
                                :width="spoolWidth + 'px'"
                                :class="spoolClass(gate)"
                                :gate-index="TOOL_GATE_BYPASS"
                                :edit-gate-map="editGateMap"
                                :edit-gate-selected="editGateSelected" />
                        </div>
                    </template>
                    <span>{{ $t('Panels.MmuPanel.ToolTip.Bypass') }}</span>
                </v-tooltip>
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
            <div class="unit-name">{{ unitDisplayName }}</div>
        </div>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuGateDetails } from '@/components/mixins/mmu'
import MmuSpool from '@/components/panels/Mmu/MmuSpool.vue'
import MmuGateStatus from '@/components/panels/Mmu/MmuGateStatus.vue'

@Component({
    components: { MmuSpool, MmuGateStatus },
})
export default class MmuUnit extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: false, default: 0 }) readonly unit!: number
    @Prop({ required: false, default: null }) readonly editGateMap!: MmuGateDetails[] | null
    @Prop({ required: false, default: -1 }) readonly editGateSelected!: number

    private svgLogo = null as string | null

    get unitDisplayName(): string {
        const name = this.unitDetails(this.unit).name
        return `#${this.unit + 1} ${name}`
    }

    get unitGateRange(): number[] {
        const unitDetails = this.unitDetails(this.unit)
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
        return this.$store.state.gui.view.mmu.showLogos ?? false
    }

    get showBypass(): boolean {
        return !this.editGateMap && this.unitDetails(this.unit).hasBypass && this.hasBypass
    }

    gateTooltip(gate: number): string[] {
        const details = this.gateDetails(gate)
        const ret = []
        if (details.status === this.GATE_EMPTY) {
            ret.push(this.$t('Panels.MmuPanel.ToolTip.Empty').toString())
        }
        if (details.filamentName && details.filamentName !== 'Unknown') {
            if (details.filamentName.length > 17) {
                ret.push(details.filamentName.substring(0, 15).trimEnd() + '...')
            } else {
                ret.push(details.filamentName)
            }
        }
        if (details.material && details.material !== 'Unknown') {
            ret.push(details.material + (details.temperature >= 0 ? ' | ' + details.temperature + '°C' : ''))
        } else {
            ret.push(this.$t('Panels.MmuPanel.ToolTip.MaterialNA').toString())
        }
        if (details.color && details.color !== '#808182E3') {
            const color = details.color
            ret.push(
                this.$t('Panels.MmuPanel.ToolTip.Color') +
                    ': ' +
                    color.substring(0, 7) +
                    (color.length > 7 && color.substring(7, 9) !== 'FF' ? color.substring(7, 9) : '')
            )
        }
        if (details.spoolId && details.spoolId > 0) {
            ret.push('Spool ID: ' + details.spoolId)
        }
        return ret
    }

    gateStatusClass(gate: number): string[] {
        const firstGate = gate === 0
        const lastGate = (gate === this.unitGateRange.length - 1 && !this.showBypass) || gate === this.TOOL_GATE_BYPASS
        let classes = ['gate-status-row']
        if (firstGate) classes.push('first-gate' + (this.isFirefox() ? '-firefox' : ''))
        if (lastGate) classes.push('last-gate' + (this.isFirefox() ? '-firefox' : ''))
        classes.push(this.$vuetify.theme.dark ? 'gate-status-row-dark-theme' : 'gate-status-row-light-theme')
        return classes
    }

    isFirefox(): boolean {
        return navigator.userAgent.indexOf('Firefox') !== -1
    }

    spoolClass(gate: number): string[] {
        let classes = []
        if (this.editGateMap) {
            if (this.editGateSelected === gate) {
                classes.push('highlight-spool')
            } else {
                if (!this.isMobile) classes.push('hover-effect')
                classes.push('unhighlight-spool')
            }
        } else if (!this.isMobile) {
            classes.push('hover-effect')
        }
        return classes
    }

    selectGate(gate: number) {
        if (this.editGateMap) {
            this.$emit('select-gate', gate)
        } else if (!this.isPrinting) {
            this.doSend('MMU_SELECT GATE=' + gate)
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
        const unitVendor = this.unitDetails(this.unit).vendor
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

.unit-name {
    display: flex;
    align-items: center;
    font-size: 12px;
    white-space: nowrap;
    margin-right: -12px;
    overflow: hidden;
    padding: 0px 0px 4px 0px;
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

.last-gate-firefox {
    border-radius: 0 8px 10px 0px;
    padding-right: 16px;
}

.first-gate-firefox {
    border-radius: 8px 0 0px 10px;
    margin-left: -16px;
    padding-left: 16px;
    margin-right: 16px;
}

.first-gate-firefox.last-gate-firefox {
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
</style>
