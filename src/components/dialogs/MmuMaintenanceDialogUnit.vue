<template>
    <div v-if="isRotaryOrServoSelector || isLinearSelector">
        <h3 class="text-h5 mb-3 mt-5">{{ name }}</h3>

        <settings-row
            v-if="isRotaryOrServoSelector"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.Selector')"
            dense
            dynamic-slot-width>
            <v-btn small :disabled="!canSend" color="secondary" @click="doSend('MMU_HOME')">
                <v-icon left>{{ mdiHomeOutline }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Home') }}
            </v-btn>
            <v-btn
                small
                :disabled="!canSend || grip === 'Gripped'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_GRIP')">
                <v-icon left>{{ mdiArrowCollapseHorizontal }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Grip') }}
            </v-btn>
            <v-btn
                small
                :disabled="!canSend || grip === 'Released'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_RELEASE')">
                <v-icon left>{{ mdiArrowExpandHorizontal }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Release') }}
            </v-btn>
        </settings-row>

        <settings-row
            v-else-if="isLinearSelector"
            :title="$t('Panels.MmuPanel.MmuMaintenanceDialog.Selector')"
            dense
            dynamic-slot-width>
            <v-btn small :disabled="!canSend" class="ml-2" color="secondary" @click="doSend('MMU_HOME')">
                <v-icon left>{{ mdiHomeOutline }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Home') }}
            </v-btn>
            <v-btn
                small
                :disabled="!canSend || servo === 'Up'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_SERVO POS=up')">
                <v-icon left>{{ mdiArrowUpThin }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Up') }}
            </v-btn>
            <v-btn
                small
                :disabled="!canSend || servo === 'Down'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_SERVO POS=down')">
                <v-icon left>{{ mdiArrowDownThin }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Down') }}
            </v-btn>
            <v-btn
                small
                :disabled="!canSend || servo === 'Move'"
                color="secondary"
                class="ml-2"
                @click="doSend('MMU_SERVO POS=move')">
                <v-icon left>{{ mdiArrowLeftRight }}</v-icon>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Move') }}
            </v-btn>
        </settings-row>

        <v-divider class="my-6" />
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import {
    mdiCloseThick,
    mdiHomeOutline,
    mdiArrowDownThin,
    mdiArrowUpThin,
    mdiArrowLeftRight,
    mdiArrowCollapseHorizontal,
    mdiArrowExpandHorizontal,
} from '@mdi/js'

@Component
export default class MmuMaintenanceStateDialogUnit extends Mixins(BaseMixin, MmuMixin) {
    mdiCloseThick = mdiCloseThick
    mdiHomeOutline = mdiHomeOutline
    mdiArrowDownThin = mdiArrowDownThin
    mdiArrowUpThin = mdiArrowUpThin
    mdiArrowLeftRight = mdiArrowLeftRight
    mdiArrowCollapseHorizontal = mdiArrowCollapseHorizontal
    mdiArrowExpandHorizontal = mdiArrowExpandHorizontal

    @Prop({ required: true }) readonly unitIndex!: number

    get unit() {
        return this.getMmuMachineUnit(this.unitIndex)
    }

    get name() {
        const name = this.unit?.name ?? 'Unit'

        return `MMU #${this.unitIndex + 1} - ${name}`
    }

    get selectorType() {
        return this.unit.selectorType ?? 'VirtualSelector'
    }

    get isRotaryOrServoSelector() {
        return ['RotarySelector', 'ServoSelector'].includes(this.selectorType)
    }

    get isLinearSelector() {
        return this.selectorType === 'LinearSelector'
    }
}
</script>
