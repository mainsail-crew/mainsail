<template>
    <div class="d-flex flex-column align-center">
        <div class="d-flex flex-wrap mb-n2 pt-1 position-relative">
            <mmu-unit-gate-spool
                class="position-relative zindex-1"
                :gate-index="gateIndex"
                :show-details="showDetails"
                :is-selected="isSelected"
                :unhighlight-spools="unhighlightSpools"
                @select-gate="selectGate" />
        </div>

        <div class="mmu-unit-box d-flex zindex-3 pb-1 pt-3" :class="gateClass(gatePos)">
            <div class="d-flex" style="width: 100%" :class="gateClassContents(gatePos)">
                <span class="gate-number rounded cursor-pointer" :class="gateNumberClass" @click="selectGate">
                    {{ gateName }}
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuMachineUnit, TOOL_GATE_BYPASS } from '@/components/mixins/mmu'

@Component
export default class MmuUnitGate extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly gateIndex!: number
    @Prop({ required: true }) readonly mmuMachineUnit!: MmuMachineUnit
    @Prop({ default: false }) readonly showDetails!: boolean
    @Prop({ required: true }) readonly selectedGate!: number
    @Prop({ default: false }) readonly unhighlightSpools!: boolean
    @Prop({ default: '' }) readonly gatePos!: string

    get gateName() {
        if (this.gateIndex === TOOL_GATE_BYPASS) return 'Bypass'
        return this.gateIndex
    }

    get gateStatus() {
        return this.mmu?.gate_status[this.gateIndex] ?? 0
    }

    get gateNumberClass() {
        return {
            active: this.isSelected,
            'border-unknown': this.gateStatus < 0,
            'border-active': this.gateStatus > 0,
            bypass: this.gateIndex === TOOL_GATE_BYPASS,
        }
    }

    get isSelected() {
        return this.selectedGate === this.gateIndex
    }

    selectGate() {
        this.$emit('select-gate', this.gateIndex)
    }

    gateCommand(command: string) {
        const fullGcode = `${command} GATE=${this.gateIndex}`
        const loading = command.toLowerCase()
        this.doSend(fullGcode, loading)
    }

    gateClass(pos: string) {
        return pos === 'L' ? 'left-gate' : pos === 'R' ? 'right-gate' : ''
    }

    gateClassContents(pos: string) {
        const baseClass = this.gateClass(pos)
        return baseClass ? `${baseClass}-contents` : ''
    }
}
</script>

<style scoped>
.zindex-1 {
    z-index: 1;
}

.zindex-3 {
    z-index: 3;
}

.gate-number {
    margin-left: 2px;
    border: 2px solid #808080;
    width: 80%;
    position: relative;
    z-index: 4;
    text-align: center;
    color: #c0c0c0;
    font-weight: bold;
    line-height: 16px;
    font-size: 14px;
}

html.theme--light .gate-number {
    color: #5d5d5d;
}

.gate-number.active {
    color: #000000;
    background-color: limegreen;
}

.gate-number.bypass {
    font-size: 10px;
    text-transform: uppercase;
    width: 90%;
    border-color: transparent !important;
}

.gate-number.border-active {
    border-color: green;
}

.gate-number.border-unknown {
    border-color: orange;
}

.v-list--dense .compact-subheader {
    height: auto;
    padding-bottom: 6px;
    display: block;
    font-size: 14px;
    text-align: center;
}

.mmu-unit-box {
    box-shadow: inset 0 4px 4px -4px #ffffff80;
    background-image: linear-gradient(to bottom, #3c3c3c 0%, #2c2c2c 100%);
    border-radius: 0px 0px 8px 8px;
    justify-content: center;
    width: 100%;
}

html.theme--light .mmu-unit-box {
    box-shadow: inset 0 4px 4px -4px #ffffff80;
    background-image: linear-gradient(to bottom, #c0c0c0 0%, #f0f0f0 100%);
}

.left-gate {
    border-radius: 8px 0 0px 0px;
    position: relative;
    margin-left: -16px;
    width: calc(100% + 16px);
}

.left-gate-contents {
    width: 100%;
    margin-left: 16px;
}

.right-gate {
    border-radius: 0 8px 0px 0px;
    position: relative;
    margin-right: -16px;
    width: calc(100% + 16px);
}

.right-gate-contents {
    width: 100%;
    margin-right: 16px;
}
</style>
