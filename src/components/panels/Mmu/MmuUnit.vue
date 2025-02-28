<template>
    <v-container>
        <div class="spool-row">{{ unitDisplayName }}</div>
        <div class="spool-row">
            <div v-for="gate in unitGateRange" :key="'gate_' + gate" :class="gateClass(gate)" @click="selectGate(gate)">
                <mmu-spool
                    :width="width"
                    :gateIndex="gate"
                    :class="spoolClass(gate)"
                    :editGateMap="editGateMap"
                    :editGateSelected="editGateSelected" />

                <mmu-gate-status :gateIndex="gate" :editGateMap="editGateMap" :editGateSelected="editGateSelected" />
            </div>

            <div v-if="!editGateMap && hasBypass" :class="gateClass(TOOL_GATE_BYPASS)" @click="selectBypass()">
                <mmu-spool
                    :width="width"
                    :gateIndex="TOOL_GATE_BYPASS"
                    :class="spoolClass(gate)"
                    :editGateMap="editGateMap"
                    :editGateSelected="editGateSelected" />

                <mmu-gate-status
                    :gateIndex="TOOL_GATE_BYPASS"
                    :editGateMap="editGateMap"
                    :editGateSelected="editGateSelected" />
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

    get unitDisplayName(): string {
        const name = this.unitDetails(this.unit).name
        return `#${this.unit + 1} ${name}`
    }

    get unitGateRange(): number[] {
        const unitDetails = this.unitDetails(this.unit)
        return Array.from({ length: unitDetails.numGates }, (v, k) => k + unitDetails.firstGate)
    }

    get width(): number {
        if (this.numGates <= 9) {
            return '56px'
        } else if (this.numGates <= 12) {
            return '48px'
        }
        return '40px'
    }

    gateClass(gate): string[] {
        let classes = ['gate-status', 'cursor-pointer']
        if (this.editGateMap && this.editGateSelected === gate) {
            classes.push('selected-gate')
        }
        return classes
    }

    spoolClass(gate): string[] {
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

    selectGate(gate): null {
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
