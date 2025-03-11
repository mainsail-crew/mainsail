<template>
    <v-container>
        <div v-if="showLogos && svgLogo" class="logo-row">
            <div class="mmu-logo" v-html="svgLogo"></div>
            <div class="spool-row">{{ unitDisplayName }}</div>
        </div>
        <div v-else class="spool-row">
            {{ unitDisplayName }}
        </div>

        <div class="spool-row">
            <div v-for="gate in unitGateRange" :key="'gate_' + gate" :class="gateClass(gate)" @click="selectGate(gate)">
                <mmu-spool
                    :width="width"
                    :class="spoolClass(gate)"
                    :gate-index="gate"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />

                <mmu-gate-status
                    :gate-index="gate"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />
            </div>

            <div v-if="!editGateMap && hasBypass" :class="gateClass(TOOL_GATE_BYPASS)" @click="selectBypass()">
                <mmu-spool
                    :width="width"
                    :class="spoolClass(gate)"
                    :gate-index="TOOL_GATE_BYPASS"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />

                <mmu-gate-status
                    :gate-index="TOOL_GATE_BYPASS"
                    :edit-gate-map="editGateMap"
                    :edit-gate-selected="editGateSelected" />
            </div>
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

    get width(): string {
        if (this.numGates <= 9) {
            return '56px'
        } else if (this.numGates <= 12) {
            return '48px'
        }
        return '40px'
    }

    get showLogos(): boolean {
        return this.$store.state.gui.view.mmu.showLogos ?? false
    }

    gateClass(gate: number): string[] {
        let classes = ['gate-status', 'cursor-pointer']
        if (this.editGateMap && this.editGateSelected === gate) {
            classes.push('selected-gate')
        }
        return classes
    }

    spoolClass(gate: number): string[] {
        let classes = []
        if (this.editGateMap) {
            if (this.editGateSelected !== gate) {
                classes.push('shrink')
                if (!this.isMobile && !this.isTablet) {
                    classes.push('grow-effect')
                }
            }
        } else if (!this.isMobile && !this.isTablet) {
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
.spool-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: 0px;
    font-size: 12px;
}

.gate-status {
    font-size: 0px;
    border-radius: 8px;
    line-height: 1em;
}

.selected-gate {
    background: #595959;
}

.logo-row {
    display: flex;
    /*  justify-content: space-between; */
    height: 48px;
    width: 100%;
}

.mmu-logo {
    fill: currentColor;
    stroke: currentColor;
    opacity: 0.7;
    padding-right: 8px;
    padding-bottom: 4px;
    height: 100%;
    width: auto;
}

.hover-effect {
    transition: transform 0.2s ease-in-out;
}

.hover-effect:hover {
    transform: translateY(-4px);
}

.shrink {
    transform: scale(0.75);
}

.grow-effect {
    transition: transform 0.2s ease-in-out;
}

.grow-effect:hover {
    transform: scale(1);
}
</style>
