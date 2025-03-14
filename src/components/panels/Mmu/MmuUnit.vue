<template>
    <v-container class="unit-container">
        <div class="spool-row">
            <div v-for="(gate, index) in unitGateRange" :key="'gate_' + gate" class="gate" @click="selectGate(gate)">
                <div :class="clipSpoolClass">
                    <mmu-spool
                        :width="spoolWidth"
                        :class="spoolClass(gate)"
                        :gate-index="gate"
                        :edit-gate-map="editGateMap"
                        :edit-gate-selected="editGateSelected" />
                </div>
                <mmu-gate-status
                    :class="gateStatusClass(index)"
                    :gate-index="gate"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />
            </div>

            <div v-if="showBypass" class="gate" @click="selectBypass()">
                <div :class="clipSpoolClass">
                    <mmu-spool
                        :width="spoolWidth"
                        :class="spoolClass(gate)"
                        :gate-index="TOOL_GATE_BYPASS"
                        :edit-gate-map="editGateMap"
                        :edit-gate-selected="editGateSelected" />
                </div>
                <mmu-gate-status
                    :class="gateStatusClass(TOOL_GATE_BYPASS)"
                    :gate-index="TOOL_GATE_BYPASS"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />
            </div>
        </div>

        <div v-if="showLogos && svgLogo" class="logo-row" :style="'height: ' + logoHeight + ';'">
            <div class="mmu-logo" v-html="svgLogo"></div>
            <div class="unit-title">{{ unitDisplayName }}</div>
        </div>
        <div v-else class="unit-title">
            {{ unitDisplayName }}
        </div>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import MmuSpool from '@/components/panels/Mmu/MmuSpool.vue'
import MmuGateStatus from '@/components/panels/Mmu/MmuGateStatus.vue'

@Component({
    components: { MmuSpool, MmuGateStatus },
})
export default class MmuUnit extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: false, default: 0 }) readonly unit!: number
    @Prop({ required: false, default: null }) readonly editGateMap!: MmuGateDetails[] | null
    @Prop({ required: false, default: -1 }) readonly editGateSelected!: number

    private svgLogo = null

    get unitDisplayName(): string {
        const name = this.unitDetails(this.unit).name
        return `#${this.unit + 1} ${name}`
    }

    get unitGateRange(): number[] {
        const unitDetails = this.unitDetails(this.unit)
        return Array.from({ length: unitDetails.numGates }, (v, k) => k + unitDetails.firstGate)
    }

    get spoolWidth(): string {
        if (this.numGates <= 8) {
            return '56px'
        } else if (this.numGates <= 16) {
            return '48px'
        }
        return '40px'
    }

    get clipSpoolClass(): string {
        if (this.numGates <= 8) {
            return 'clip-large-spool'
        } else if (this.numGates <= 16) {
            return 'clip-medium-spool'
        }
        return 'clip-small-spool'
    }

    get logoHeight(): string {
        if (this.numGates <= 8) {
            return '48px'
        } else if (this.numGates <= 16) {
            return '40px'
        }
        return '32px'
    }

    get showLogos(): boolean {
        return this.$store.state.gui.view.mmu.showLogos ?? false
    }

    get showBypass(): boolean {
        return !this.editGateMap && this.hasBypass
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

.unit-title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    font-size: 12px;
    padding: 0px 0px 8px 0px;
    width: 100%;
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

.gate-status-row-dark-theme {
    box-shadow: inset 0px 4px 4px -4px #ffffff80;
    background-image: linear-gradient(to bottom, #3c3c3c 0%, #2c2c2c 100%);
}

.gate-status-row-light-theme {
    box-shadow: inset 0px 4px 4px -4px #ffffff80;
    background-image: linear-gradient(to bottom, #d0d0d0 0%, #f0f0f0ff 100%);
}

.first-gate {
    border-radius: 8px 0 0px 8px;
    margin-left: -16px;
    padding-left: 16px;
}

.last-gate {
    border-radius: 0 8px 8px 0px;
    margin-right: -16px;
    padding-right: 16px;
}

.first-gate.last-gate {
    border-radius: 8px 8px 10px 10px;
}

.clip-small-spool {
    margin-top: 8px;
    max-height: 73px;
}

.clip-medium-spool {
    margin-top: 8px;
    max-height: 88px;
}

.clip-large-spool {
    margin-top: 8px;
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
    box-shadow: inset 0px -8px 8px -6px #ffff00e0;
}

.unhighlight-spool {
    opacity: 0.4;
}

.logo-row {
    display: flex;
    overflow: hidden;
    margin-left: -16px;
    width: 100%;
    border-radius: 0 0 10px 10px;
}

.mmu-logo {
    fill: currentColor;
    stroke: currentColor;
    opacity: 0.7;
    padding: 4px 16px 8px 16px;
}

.hover-effect {
    transition: transform 0.2s ease-in-out;
}

.hover-effect:hover {
    transform: translateY(-5px);
    opacity: 1;
}
</style>
