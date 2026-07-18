<template>
    <v-list-item>
        <v-btn small class="w-100" :disabled="isDisabled" :loading="isLoading" @click="runMenuItem">
            <v-icon left>{{ item.icon }}</v-icon>
            {{ item.label }}
        </v-btn>
    </v-list-item>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { MmuUnitGateContextMenuItem } from '@/components/mixins/mmu'

@Component
export default class MmuUnitGateMenuItem extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ type: Object, required: true }) readonly item!: MmuUnitGateContextMenuItem
    @Prop({ required: true }) readonly gateIndex!: number

    get isDisabled(): boolean {
        if (!this.item.disabled) return false

        if (typeof this.item.disabled === 'function') {
            return this.item.disabled(this.gateIndex)
        }

        return this.item.disabled
    }

    get isLoading(): boolean {
        return this.loadings.includes(this.item.loading)
    }

    runMenuItem() {
        if (this.isDisabled) return

        this.$emit('close-context-menu')

        if (this.item.action.kind === 'gcode' && 'command' in this.item.action) {
            if (!this.canSend) return

            this.doSend(`${this.item.action.command} GATE=${this.gateIndex}`, this.item.loading)
            return
        }

        if (this.item.action.kind === 'call' && 'fn' in this.item.action) {
            this.item.action.fn(this.gateIndex)
            return
        }
    }
}
</script>
