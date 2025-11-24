<template>
    <v-card class="mmuEditTtgMapDialogTool" :class="cardClasses" @click="selectTool">
        <v-card-title class="justify-center py-0">{{ title }}</v-card-title>
        <v-card-text class="px-2 py-0">
            <v-row>
                <v-col cols="5" class="pr-0">
                    <mmu-unit-gate-spool svg-class="w-100" :gate-index="gate" />
                </v-col>
                <v-col cols="7" class="d-flex flex-column justify-space-between pl-1">
                    <div class="body-2 text-center">
                        <div>{{ $t('Panels.MmuPanel.TtgMapDialog.Gate') }}</div>
                        <div class="body-1 font-weight-bold">#{{ gate }}</div>
                    </div>
                    <div class="body-2 text-center">
                        <v-divider />
                        <div class="font-smaller text-truncate">
                            <span class="infinity">&infin;</span>
                            {{ endlessSpoolText }}
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_BYPASS, TOOL_GATE_UNKNOWN } from '@/components/mixins/mmu'

@Component
export default class MmuEditTtgMapDialogTool extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly gate!: number
    @Prop({ required: true }) readonly tool!: number
    @Prop({ default: false }) readonly isSelected!: boolean
    @Prop({ default: false }) readonly isDisabled!: boolean

    get title() {
        if (this.tool === TOOL_GATE_BYPASS) return this.$t('Panels.MmuPanel.Bypass')
        if (this.tool === TOOL_GATE_UNKNOWN) return `T?`

        return `T${this.tool}`
    }

    get endlessSpoolText() {
        const currentGroup = this.endlessSpoolGroups[this.gate]

        const eSGates = this.endlessSpoolGroups
            .map((_, i) => (this.gate + i) % this.endlessSpoolGroups.length)
            .filter((idx) => idx !== this.gate && this.endlessSpoolGroups[idx] === currentGroup)

        return eSGates.join(', ') || this.$t('Panels.MmuPanel.TtgMapDialog.None')
    }

    get cardClasses() {
        return {
            'is-selected': this.isSelected,
            'is-disabled': this.isDisabled,
        }
    }

    selectTool() {
        this.$emit('select-tool', this.tool)
    }
}
</script>

<style scoped>
.mmuEditTtgMapDialogTool {
    min-width: 105px;
    flex-basis: 0;
    background: #2c2c2c;
    cursor: pointer;
}

html.theme--light .mmuEditTtgMapDialogTool {
    background: #f0f0f0;
}

.mmuEditTtgMapDialogTool.is-selected {
    background: #595959 !important;
}

.mmuEditTtgMapDialogTool.is-disabled {
    opacity: 0.5;
}

.font-smaller {
    font-size: 0.75rem;
}

.infinity {
    position: relative;
    top: 1px;
}
</style>
