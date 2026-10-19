<template>
    <div class="d-flex">
        <v-tooltip top>
            <template #activator="{ on, attrs }">
                <v-btn icon tile :disabled="cleanDisabled" v-bind="attrs" v-on="on" @click="medusahcSend('CLEAN')">
                    <v-icon>{{ mdiBrush }}</v-icon>
                </v-btn>
            </template>
            <span>{{ $t('Panels.MedusahcPanel.CleanNozzle') }}</span>
        </v-tooltip>
        <v-tooltip top>
            <template #activator="{ on, attrs }">
                <v-btn icon tile :disabled="dropDisabled" v-bind="attrs" v-on="on" @click="medusahcSend('MHC_DROP')">
                    <v-icon>{{ mdiTrayArrowUp }}</v-icon>
                </v-btn>
            </template>
            <span>{{ $t('Panels.MedusahcPanel.DropTool') }}</span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MedusahcMixin from '@/components/mixins/medusahc'
import { mdiBrush, mdiTrayArrowUp } from '@mdi/js'

@Component
export default class MedusahcPanelButtons extends Mixins(BaseMixin, MedusahcMixin) {
    mdiBrush = mdiBrush
    mdiTrayArrowUp = mdiTrayArrowUp

    get busy(): boolean {
        return this.printerIsPrinting || this.medusahcOperation !== 'idle'
    }

    get cleanDisabled(): boolean {
        return this.busy || this.medusahcCurrentTool < 0
    }

    get dropDisabled(): boolean {
        return this.busy || this.medusahcCurrentTool < 0
    }
}
</script>
