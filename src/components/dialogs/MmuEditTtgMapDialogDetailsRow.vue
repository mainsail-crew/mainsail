<template>
    <tr :class="rowClass" @click="selectGate">
        <td class="text-center">{{ gate }}</td>
        <td class="px-0 py-2 w-36">
            <mmu-unit-gate-spool svg-class="w-36" :gate-index="gate" />
        </td>
        <td class="py-0" style="width: 264px">
            <mmu-gate-summary :gate-index="gate" :compact="true" />
        </td>
        <td class="text-right">
            <span class="es-group-icon" :class="endlessSpoolClass" @click.stop="selectEndlessSpoolGroup" />
        </td>
    </tr>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { GATE_EMPTY } from '@/components/mixins/mmu'

@Component({})
export default class MmuGateDialogRow extends Mixins(BaseMixin, MmuMixin) {
    @Prop({ required: true }) readonly gate!: number
    @Prop({ required: true }) readonly selectedGate!: number

    get rowClass() {
        return {
            'cursor-pointer': true,
            'disabled-row': this.gateStatus === GATE_EMPTY,
            'selected-row': this.gate === this.selectedGate,
        }
    }

    get gateStatus() {
        const status = this.mmu?.gate_status ?? []

        return status[this.gate] ?? GATE_EMPTY
    }

    get endlessSpoolGroup() {
        return this.endlessSpoolGroups[this.gate] ?? null
    }

    get selectedEndlessSpoolGroup() {
        return this.endlessSpoolGroups[this.selectedGate] ?? null
    }

    get endlessSpoolClass() {
        return {
            'disabled-group': this.selectedEndlessSpoolGroup === this.gate,
            'selected-group': this.endlessSpoolGroup === this.selectedEndlessSpoolGroup,
        }
    }

    selectGate() {
        this.$emit('select-gate')
    }

    selectEndlessSpoolGroup() {
        this.$emit('select-endless-spool-group')
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

::v-deep .w-36 {
    width: 36px;
}

.es-group-icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 25%;
    border: 1px solid var(--v-secondary-lighten3);
    vertical-align: middle;
    cursor: context-menu;
}

.es-group-icon.disabled-group {
    cursor: not-allowed;
}

.es-group-icon.selected-group {
    background-color: limegreen;
}
</style>
