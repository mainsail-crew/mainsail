<template>
    <v-dialog v-model="showDialog" width="600" persistent :fullscreen="isMobile">
        <panel
            :title="$t('Panels.MmuPanel.MmuMaintenanceTitle')"
            :icon="mdiWrenchCog"
            card-class="mmu-edit-ttg-map-dialog"
            :margin-bottom="false">
            <template #buttons>
                <v-btn icon tile @click="showDialog = false">
                    <v-icon>{{ mdiCloseThick }}</v-icon>
                </v-btn>
            </template>

            <v-card-subtitle>
                {{ $t('Panels.MmuPanel.MmuMaintenanceDialog.Intro') }}
            </v-card-subtitle>

            <v-card-text>
                <mmu-maintenance-dialog-actions />
                <mmu-maintenance-dialog-unit v-for="i in mmuNumUnits" :key="'unit_' + i" :unit-index="i - 1" />
                <mmu-maintenance-dialog-leds v-for="unit in mmuLedUnits" :key="'mmuLeds_' + unit" :unit-name="unit" />
                <mmu-maintenance-dialog-config />
            </v-card-text>
        </panel>
    </v-dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, VModel } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin from '@/components/mixins/mmu'
import { mdiCloseThick, mdiWrenchCog } from '@mdi/js'

@Component
export default class MmuMaintenanceStateDialog extends Mixins(BaseMixin, MmuMixin) {
    mdiCloseThick = mdiCloseThick
    mdiWrenchCog = mdiWrenchCog

    @VModel({ type: Boolean }) showDialog!: boolean

    get mmuLedUnits() {
        return Object.keys(this.$store.state.printer)
            .filter((key) => key.toLowerCase().startsWith('mmu_leds '))
            .map((key) => {
                return key.slice(9)
            })
    }
}
</script>
