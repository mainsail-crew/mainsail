<template>
    <div class="d-flex flex-column align-center">
        <!-- Important context menu -->
        <v-menu
            v-model="contextMenu"
            transition="slide-y-transition"
            :position-x="menuX"
            :position-y="menuY"
            :close-on-content-click="false"
            :open-on-click="false"
            absolute
            offset-y>
            <template #activator="{ attrs }">
                <div
                    class="d-flex"
                    v-bind="attrs"
                    @contextmenu.prevent.stop="openContextMenu"
                    @pointerdown="onPointerDown"
                    @pointerup="onPointerUp"
                    @pointercancel="onPointerUp"
                    @pointerleave="onPointerUp">
                    <mmu-unit-gate-spool
                        class="position-relative zindex-1"
                        :gate-index="gateIndex"
                        :show-details="showDetails"
                        :is-selected="isSelected"
                        :unhighlight-spools="unhighlightSpools"
                        @select-gate="selectGate" />
                </div>
            </template>

            <v-list dense @mouseleave="closeContextMenu">
                <v-subheader class="compact-subheader">Gate {{ gateIndex }}</v-subheader>
                <v-divider />
                <v-list-item>
                    <v-btn
                        small
                        style="width: 100%"
                        :disabled="!canSend"
                        :loading="loadings.includes('mmu_select')"
                        @click="gateCommand('MMU_SELECT')">
                        <v-icon left>
                            {{ mdiSwapHorizontal }}
                        </v-icon>
                        {{ $t('Panels.MmuPanel.ButtonSelect') }}
                    </v-btn>
                </v-list-item>
                <v-list-item>
                    <v-btn
                        small
                        style="width: 100%"
                        :disabled="!canSend"
                        :loading="loadings.includes('mmu_preload')"
                        @click="gateCommand('MMU_PRELOAD')">
                        <v-icon left>
                            {{ mdiDownloadOutline }}
                        </v-icon>
                        {{ $t('Panels.MmuPanel.ButtonPreload') }}
                    </v-btn>
                </v-list-item>
                <v-list-item>
                    <v-btn
                        small
                        style="width: 100%"
                        :disabled="!canSend"
                        :loading="loadings.includes('mmu_eject')"
                        @click="gateCommand('MMU_EJECT')">
                        <v-icon left>
                            {{ mdiEject }}
                        </v-icon>
                        {{ $t('Panels.MmuPanel.ButtonEject') }}
                    </v-btn>
                </v-list-item>
            </v-list>
        </v-menu>

        <span class="gate-number rounded cursor-pointer" :class="gateNumberClass" @click="selectGate">
            {{ gateName }}
        </span>
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuMachineUnit, TOOL_GATE_BYPASS } from '@/components/mixins/mmu'
import { mdiSwapHorizontal, mdiDownloadOutline, mdiEject } from '@mdi/js'

@Component
export default class MmuUnitGate extends Mixins(BaseMixin, MmuMixin) {
    mdiSwapHorizontal = mdiSwapHorizontal
    mdiDownloadOutline = mdiDownloadOutline
    mdiEject = mdiEject

    @Prop({ required: true }) readonly gateIndex!: number
    @Prop({ required: true }) readonly mmuMachineUnit!: MmuMachineUnit
    @Prop({ default: false }) readonly showDetails!: boolean
    @Prop({ default: false }) readonly showContextMenu!: boolean
    @Prop({ required: true }) readonly selectedGate!: number
    @Prop({ default: false }) readonly unhighlightSpools!: boolean

    closeTimeout: number | null = null
    contextMenu = false
    menuX = 0
    menuY = 0

    // Long-press state
    longPressTimeout: number | null = null
    longPressDuration = 500
    isPressing = false
    pressStartX = 0
    pressStartY = 0

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

    openContextMenu(e: MouseEvent) {
        e.preventDefault()
        this.openContextMenuAt(e.clientX, e.clientY)
    }

    openContextMenuAt(clientX: number, clientY: number) {
        if (this.gateIndex < 0 || this.gateIndex === this.selectedGate || !this.showContextMenu) return

        this.menuX = clientX - 20
        this.menuY = clientY - 20

        this.closeContextMenu()

        this.contextMenu = true
        this.closeTimeout = setTimeout(() => {
            this.closeContextMenu()
        }, 6000)
    }

    closeContextMenu() {
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout)
        }
        this.closeTimeout = null
        this.contextMenu = false
    }

    onPointerDown(e: PointerEvent) {
        if (this.gateIndex < 0 || this.gateIndex === this.selectedGate || !this.showContextMenu) return

        dispatchEvent(new CustomEvent('mmu-close-all-menus'))

        this.isPressing = true
        this.pressStartX = e.clientX
        this.pressStartY = e.clientY

        this.clearLongPressTimeout()
        this.longPressTimeout = setTimeout(() => {
            if (this.isPressing) {
                this.openContextMenuAt(this.pressStartX, this.pressStartY)
            }
            this.clearPressState()
        }, this.longPressDuration)
    }

    onPointerUp() {
        this.clearPressState()
    }

    clearPressState() {
        this.isPressing = false
        this.clearLongPressTimeout()
    }

    clearLongPressTimeout() {
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout)
        }
        this.longPressTimeout = null
    }

    mounted() {
        addEventListener('mmu-close-all-menus', this.onGlobalCloseMenus)
    }

    beforeDestroy() {
        removeEventListener('mmu-close-all-menus', this.onGlobalCloseMenus)

        this.closeContextMenu()
        this.clearLongPressTimeout()
        this.isPressing = false
    }

    onGlobalCloseMenus = () => {
        this.closeContextMenu()
    }

    gateCommand(command: string) {
        const fullGcode = `${command} GATE=${this.gateIndex}`
        const loading = command.toLowerCase()
        this.doSend(fullGcode, loading)
    }
}
</script>

<style scoped>
.zindex-1 {
    z-index: 1;
}

.gate-number {
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
</style>
