<template>
    <v-container class="d-flex flex-column">
        <v-row dense>
            <v-col cols="6">
                <v-tooltip top color="secondary">
                    <template #activator="{ on }">
                        <v-btn
                            ref="refBtn"
                            block
                            small
                            color="secondary"
                            :class="btnClass"
                            :disabled="
                                !canSend || [GATE_AVAILABLE, GATE_AVAILABLE_FROM_BUFFER].includes(currentGateStatus)
                            "
                            :loading="loadings.includes('mmu_preload')"
                            v-on="showTooltip ? on : {}"
                            @click="doLoadingSend('MMU_PRELOAD', 'mmu_preload')">
                            <v-icon left>{{ mdiDownloadOutline }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonPreload') }}
                        </v-btn>
                    </template>
                    {{ $t('Panels.MmuPanel.ButtonPreload') }}
                </v-tooltip>
            </v-col>
            <v-col cols="6">
                <v-tooltip top color="secondary">
                    <template #activator="{ on }">
                        <v-btn
                            block
                            small
                            color="secondary"
                            :class="btnClass"
                            :disabled="!canSend || [GATE_EMPTY].includes(currentGateStatus)"
                            :loading="loadings.includes('mmu_eject')"
                            v-on="showTooltip ? on : {}"
                            @click="doLoadingSend('MMU_EJECT', 'mmu_eject')">
                            <v-icon left>{{ mdiEject }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonEject') }}
                        </v-btn>
                    </template>
                    {{ $t('Panels.MmuPanel.ButtonEject') }}
                </v-tooltip>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col cols="6">
                <v-tooltip top color="secondary">
                    <template #activator="{ on }">
                        <v-btn
                            block
                            small
                            color="secondary"
                            :class="btnClass"
                            :disabled="!canSend"
                            :loading="loadings.includes('mmu_check_gate')"
                            v-on="showTooltip ? on : {}"
                            @click="doLoadingSend('MMU_CHECK_GATE', 'mmu_check_gate')">
                            <v-icon left>{{ mdiCheck }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonCheckGate') }}
                        </v-btn>
                    </template>
                    {{ $t('Panels.MmuPanel.ButtonCheckGate') }}
                </v-tooltip>
            </v-col>
            <v-col cols="6">
                <v-tooltip top color="secondary">
                    <template #activator="{ on }">
                        <v-btn
                            block
                            small
                            color="secondary"
                            :class="btnClass"
                            :disabled="!canSend"
                            :loading="loadings.includes('mmu_recover')"
                            v-on="showTooltip ? on : {}"
                            @click="doLoadingSend('MMU_RECOVER', 'mmu_recover')">
                            <v-icon left>{{ mdiAutoFix }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonRecover') }}
                        </v-btn>
                    </template>
                    {{ $t('Panels.MmuPanel.ButtonRecover') }}
                </v-tooltip>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col cols="2"></v-col>
            <v-col cols="8">
                <v-tooltip top color="secondary">
                    <template #activator="{ on }">
                        <v-btn
                            block
                            small
                            color="secondary"
                            :class="btnClass"
                            :disabled="!canSend || !isMmuPausedAndLocked"
                            :loading="loadings.includes('mmu_unlock')"
                            v-on="showTooltip ? on : {}"
                            @click="doLoadingSend('MMU_UNLOCK', 'mmu_unlock')">
                            <v-icon left>{{ mdiThermometerPlus }}</v-icon>
                            {{ $t('Panels.MmuPanel.ButtonUnlock') }}
                        </v-btn>
                    </template>
                    {{ $t('Panels.MmuPanel.ButtonUnlock') }}
                </v-tooltip>
            </v-col>
            <v-col cols="2"></v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-tooltip top color="secondary">
                    <template #activator="{ on }">
                        <v-btn
                            large
                            block
                            color="secondary"
                            class="wrap-text-btn"
                            :class="btnClass"
                            :disabled="!canSend || filamentPos === FILAMENT_POS_UNLOADED"
                            :loading="loadings.includes('mmu_unload')"
                            v-on="showTooltip ? on : {}"
                            @click="doLoadingSend('MMU_UNLOAD', 'mmu_unload')">
                            <v-icon left>{{ mdiUpload }}</v-icon>
                            {{ unloadButtonText }}
                        </v-btn>
                    </template>
                    {{ unloadButtonText }}
                </v-tooltip>
            </v-col>
            <v-col cols="6">
                <v-tooltip top color="secondary">
                    <template #activator="{ on }">
                        <v-btn
                            large
                            block
                            color="secondary"
                            class="wrap-text-btn"
                            :class="btnClass"
                            :disabled="!canSend || filamentPos !== FILAMENT_POS_UNLOADED"
                            :loading="loadings.includes('mmu_load')"
                            v-on="showTooltip ? on : {}"
                            @click="doLoadingSend('MMU_LOAD', 'mmu_load')">
                            <v-icon left>{{ mdiDownload }}</v-icon>
                            {{ loadButtonText }}
                        </v-btn>
                    </template>
                    {{ loadButtonText }}
                </v-tooltip>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, {
    TOOL_GATE_BYPASS,
    GATE_AVAILABLE,
    GATE_AVAILABLE_FROM_BUFFER,
    GATE_EMPTY,
} from '@/components/mixins/mmu'
import { mdiDownloadOutline, mdiEject, mdiCheck, mdiAutoFix, mdiThermometerPlus, mdiDownload, mdiUpload } from '@mdi/js'

@Component({})
export default class MmuControls extends Mixins(BaseMixin, MmuMixin) {
    GATE_AVAILABLE = GATE_AVAILABLE
    GATE_AVAILABLE_FROM_BUFFER = GATE_AVAILABLE_FROM_BUFFER
    GATE_EMPTY = GATE_EMPTY

    mdiDownloadOutline = mdiDownloadOutline
    mdiEject = mdiEject
    mdiCheck = mdiCheck
    mdiAutoFix = mdiAutoFix
    mdiThermometerPlus = mdiThermometerPlus
    mdiUpload = mdiUpload
    mdiDownload = mdiDownload

    private btnSize: number = 2

    get unloadButtonText() {
        if (this.mmuGate === TOOL_GATE_BYPASS) return this.$t('Panels.MmuPanel.ButtonUnloadExt')
        return this.$t('Panels.MmuPanel.ButtonUnload')
    }

    get loadButtonText() {
        if (this.mmuGate === TOOL_GATE_BYPASS) return this.$t('Panels.MmuPanel.ButtonLoadExt')
        return this.$t('Panels.MmuPanel.ButtonLoad')
    }

    @Debounce(500)
    checkButtonWidth() {
        this.$nextTick(() => {
            const btn = this.$refs.refBtn
            if (btn) {
                const width = btn.$el.offsetWidth
                if (width === 0) {
                    this.btnSize = 2
                } else if (width < 95) {
                    this.btnSize = 0
                } else if (width < 120) {
                    this.btnSize = 1
                } else {
                    this.btnSize = 2
                }
            }
        })
    }

    get btnClass(): string[] {
        const classes = ['base-btn']
        if (this.btnSize === 0) {
            classes.push('btn-no-text')
        } else if (this.btnSize === 1) {
            classes.push('btn-small-text')
        }
        return classes
    }

    get showTooltip(): boolean {
        return this.btnSize === 0
    }

    get currentGateStatus(): number {
        return this.$store.state.printer.mmu?.gate_status?.[this.mmuGate] ?? -1
    }

    get largeFilamentStatus(): boolean {
        return this.$store.state.gui.view.mmu.largeFilamentStatus
    }

    @Watch('largeFilamentStatus')
    onFilamentStatusSizeChange(): void {
        this.checkButtonWidth()
    }

    mounted() {
        this.checkButtonWidth()
        window.addEventListener('resize', this.checkButtonWidth)
    }

    beforeDestroy() {
        window.removeEventListener('resize', this.checkButtonWidth)
    }
}
</script>

<style scoped>
.base-btn {
    max-width: 100%;
    overflow: hidden;
}

.wrap-text-btn {
    min-height: 3em;
    display: inline-block;
    white-space: normal;
}

.btn-small-text {
    font-size: 0.6em;
}

.btn-small-text .v-icon {
    margin-right: 2px;
}

.btn-no-text {
    font-size: 0;
}

.btn-no-text .v-icon {
    margin-right: 0;
}
</style>
