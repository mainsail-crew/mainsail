<template>
    <div class="d-flex flex-column align-center">
        <div
            v-longpress:500="openContextMenu"
            class="d-flex flex-wrap mb-n2 pt-1 position-relative"
            @contextmenu.prevent="openContextMenu($event)">
            <mmu-unit-gate-spool
                class="position-relative zindex-1"
                :gate-index="gateIndex"
                :show-details="showDetails"
                :is-selected="isSelected"
                :unhighlight-spools="unhighlightSpools"
                @select-gate="selectGate" />
        </div>
        <div class="mmu-unit-box d-flex zindex-3 pb-1 pt-2" :class="gateClass">
            <div class="d-flex" style="width: 100%" :class="gateClassContents">
                <span class="gate-number rounded cursor-pointer" :class="gateNumberClass" @click="selectGate">
                    {{ gateName }}
                </span>
            </div>
        </div>
        <v-menu
            v-model="contextMenu"
            transition="slide-y-transition"
            :position-x="menuX"
            :position-y="menuY"
            :close-on-content-click="false"
            absolute
            offset-y>
            <v-list dense @mouseleave="closeContextMenu">
                <v-subheader class="d-block text-subtitle-2 text-center mb-0 h-auto pb-2">
                    {{ $t('Panels.MmuPanel.Gate') }} {{ gateIndex }}
                </v-subheader>
                <v-divider class="mb-2" />
                <v-list-item v-for="(button, index) in contextMenuButtons" :key="index">
                    <v-btn
                        small
                        class="w-100"
                        :disabled="!canSend"
                        :loading="loadings.includes(button.command.toLowerCase())"
                        @click="gateCommand(button.command)">
                        <v-icon left>{{ button.icon }}</v-icon>
                        {{ button.label }}
                    </v-btn>
                </v-list-item>
            </v-list>
        </v-menu>
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
    @Prop({ default: '' }) readonly gatePos!: string

    closeTimeout: number | null = null
    contextMenu = false
    menuX = 0
    menuY = 0

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

    get contextMenuButtons() {
        return [
            { icon: this.mdiSwapHorizontal, command: 'MMU_SELECT', label: this.$t('Panels.MmuPanel.ButtonSelect') },
            { icon: this.mdiDownloadOutline, command: 'MMU_PRELOAD', label: this.$t('Panels.MmuPanel.ButtonPreload') },
            { icon: this.mdiEject, command: 'MMU_EJECT', label: this.$t('Panels.MmuPanel.ButtonEject') },
        ]
    }

    get gateClass() {
        if (this.gatePos === 'L') {
            return 'left-gate'
        }

        if (this.gatePos === 'R') {
            return 'right-gate'
        }

        return ''
    }

    get gateClassContents() {
        return this.gateClass ? `${this.gateClass}-contents` : ''
    }

    selectGate() {
        this.$emit('select-gate', this.gateIndex)
    }

    openContextMenu(e: MouseEvent) {
        e.preventDefault()

        if (this.gateIndex < 0 || this.gateIndex === this.selectedGate || !this.showContextMenu) return

        this.menuX = e.clientX - 20
        this.menuY = e.clientY - 20

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

    mounted() {
        addEventListener('mmu-close-gate-context-menus', this.closeContextMenu)
    }

    beforeDestroy() {
        removeEventListener('mmu-close-gate-context-menus', this.closeContextMenu)
        this.clearCloseTimeout()
    }

    gateCommand(command: string) {
        this.doSend(`${command} GATE=${this.gateIndex}`, command.toLowerCase())
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
    position: relative;
    margin-left: -16px;
    width: calc(100% + 16px);
}

.left-gate-contents {
    width: 100%;
    margin-left: 16px;
}

.right-gate {
    border-radius: 0 8px 0 0;
    position: relative;
    margin-right: -16px;
    width: calc(100% + 16px);
}

.right-gate-contents {
    width: 100%;
    margin-right: 16px;
}
</style>
