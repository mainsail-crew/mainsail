<template>
    <tr
        :class="rowClass"
        @click="$emit('select-gate', details.index)"
        @mouseover="$emit('mouseover', details.index)"
        @mouseleave="$emit('mouseleave', details.index)">
        <td>{{ details.index }}</td>
        <td class="pr-0 py-2">
            <mmu-spool
                :gate-index="details.index"
                :show-percent="false"
                style="height: 60px; float: left"
                class="mr-0" />
        </td>
        <td class="py-0" style="min-width: 264px; max-width: 264px">
            <mmu-gate-summary :gate-index="details.index" :show-details="true" :show-gate="false" :compact="true" />
        </td>
        <td>
            <span
                class="es-group-icon"
                :style="{
                    background: details.endlessSpoolGroup === selectedEsGroup ? 'limegreen' : 'none',
                    cursor: 'context-menu',
                }"
                @click.stop="$emit('select-es', details.index)" />
        </td>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import type { MmuGateDetails } from '@/store/server/mmu/types'

@Component({})
export default class MmuGateDialogRow extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) declare readonly details: MmuGateDetails
    @Prop({ required: true }) declare readonly selectedGate: number | null
    @Prop({ required: true }) declare readonly selectedEsGroup: number | null

    get rowClass(): string[] {
        let classes = ['cursor-pointer']
        if (this.details.index === this.selectedGate) classes.push('selected-row')
        if (this.details.status === this.GATE_EMPTY) classes.push('disabled-row')
        return classes
    }
}
</script>

<style scoped>
.v-data-table__table {
    table-layout: fixed;
}

.selected-row {
    background: #595959;
}

.disabled-row {
    opacity: 0.7;
}

.es-group-icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 25%;
    border: 1px solid var(--v-secondary-lighten3);
    vertical-align: middle;
}
</style>
