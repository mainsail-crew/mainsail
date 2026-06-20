<template>
    <div class="d-flex flex-column align-center" :class="cursorType" @click="handleClickGate" @contextmenu.prevent>
        <div class="d-flex flex-wrap mb-n2 pt-1 position-relative">
            <mmu-unit-gate-spool
                class="position-relative zindex-1"
                :gate-index="gateIndex"
                :show-details="showDetails"
                :is-selected="isSelected"
                :unhighlight-spools="unhighlightSpools" />
        </div>

        <div class="mmu-unit-box d-flex zindex-3 pb-1 pt-2 position-relative" :class="gateClass">
            <div class="d-flex w-100 gate-contents">
                <span class="gate-number rounded" :class="gateNumberClass">
                    {{ gateName }}
                </span>
            </div>
        </div>
        <mmu-unit-gate-menu
            v-model="contextMenu"
            :gate-index="gateIndex"
            :mmu-machine-unit="mmuMachineUnit"
            :menu-x="menuX"
            :menu-y="menuY"
            :selected-gate="selectedGate"
            @select-gate="selectGate"
            @edit-filament="$emit('edit-filament', $event)" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import type { LongpressEvent } from '@/directives/longpress'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuMachineUnit, TOOL_GATE_BYPASS } from '@/components/mixins/mmu'
import MmuUnitGateMenu from '@/components/panels/Mmu/MmuUnitGateMenu.vue'

@Component({
    components: { MmuUnitGateMenu },
})
export default class MmuUnitGate extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly gateIndex!: number
    @Prop({ required: true }) readonly mmuMachineUnit!: MmuMachineUnit
    @Prop({ default: false }) readonly showDetails!: boolean
    @Prop({ default: false }) readonly showContextMenu!: boolean
    @Prop({ required: true }) readonly selectedGate!: number
    @Prop({ default: false }) readonly unhighlightSpools!: boolean
    @Prop({ default: false }) readonly hasBypass!: boolean

    closeTimeout: number | null = null
    contextMenu = false
    menuX = 0
    menuY = 0

    get cursorType() {
        return this.showContextMenu ? 'gate-menu' : 'gate-selection'
    }

    get gateName() {
        return this.gateIndex === TOOL_GATE_BYPASS ? 'Bypass' : this.gateIndex.toString()
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

    get gatePosition() {
        const firstGateNumber = this.mmuMachineUnit?.first_gate ?? 0
        return this.gateIndex + 1 - firstGateNumber
    }

    get firstGate() {
        return this.gatePosition === 1
    }

    get lastGate() {
        if (this.gateIndex === TOOL_GATE_BYPASS) return true

        return this.gatePosition === this.mmuMachineUnit?.num_gates && !this.hasBypass
    }

    get gateClass() {
        return {
            'left-gate': this.firstGate,
            'right-gate': this.lastGate,
        }
    }

    handleClickGate(e: MouseEvent) {
        if (this.showContextMenu) return this.openContextMenu(e)

        this.selectGate()
    }

    selectGate() {
        this.$emit('select-gate', this.gateIndex)
    }

    openContextMenu(e: MouseEvent | LongpressEvent) {
        e.preventDefault()

        this.menuX = (e.clientX ?? 0) - 20
        this.menuY = (e.clientY ?? 0) - 20

        this.closeContextMenu()

        this.contextMenu = true
        this.closeTimeout = window.setTimeout(() => {
            this.closeContextMenu()
        }, 8000)
    }

    closeContextMenu() {
        this.clearCloseTimeout()
        this.contextMenu = false
    }

    clearCloseTimeout() {
        if (this.closeTimeout === null) return
        clearTimeout(this.closeTimeout)
        this.closeTimeout = null
    }

    beforeDestroy() {
        this.clearCloseTimeout()
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

.mmu-unit-box {
    box-shadow: inset 0 4px 4px -4px #ffffff80;
    background-image: linear-gradient(to bottom, #3c3c3c 0%, #2c2c2c 100%);
    border-radius: 0 0 8px 8px;
    justify-content: center;
    width: 100%;
}

html.theme--light .mmu-unit-box {
    box-shadow: inset 0 4px 4px -4px #ffffff80;
    background-image: linear-gradient(to bottom, #c0c0c0 0%, #f0f0f0 100%);
}

.left-gate {
    border-radius: 8px 0 0 0;
    margin-left: -16px;
    width: calc(100% + 16px);
}

.left-gate .gate-contents {
    margin-left: 16px;
}

.right-gate {
    border-radius: 0 8px 0 0;
    margin-right: -16px;
    width: calc(100% + 16px);
}

.right-gate .gate-contents {
    margin-right: 16px;
}

.left-gate.right-gate {
    border-radius: 8px 8px 0 0;
    width: calc(100% + 32px);
    margin-right: -16px;
}

.gate-selection {
    cursor: pointer;
}

.gate-menu {
    cursor: context-menu;
}
</style>
