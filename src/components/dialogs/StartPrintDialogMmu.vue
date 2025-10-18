<template>
    <v-card-text class="pb-0">
        <v-divider class="mt-4 mb-4" />
        <p class="body-2">
            {{ summary }}
        </p>
        <div class="text-center">
            <v-btn color="primary" medium @click="showEditTtgMapDialog = true">
                <v-icon left>{{ mdiStateMachine }}</v-icon>
                {{ $t('Panels.MmuPanel.EditTtgMap') }}
            </v-btn>
        </div>
        <v-divider :class="classSecondDivider" />
        <mmu-edit-ttg-map-dialog v-model="showEditTtgMapDialog" :file="file" />
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import MmuMixin, { TOOL_GATE_BYPASS } from '@/components/mixins/mmu'
import { FileStateGcodefile } from '@/store/files/types'
import { mdiStateMachine } from '@mdi/js'

@Component({})
export default class StartPrintDialogMmu extends Mixins(BaseMixin, MmuMixin) {
    mdiStateMachine = mdiStateMachine

    showEditTtgMapDialog = false

    @Prop({ required: true }) readonly file!: FileStateGcodefile

    get summary() {
        const referencedTools = this.file.referenced_tools ?? ''
        const numTools = referencedTools.length
        if (numTools <= 1 && this.mmuGate !== TOOL_GATE_BYPASS) {
            return this.$t('Panels.MmuPanel.StartPrintDialogMmu.SingleColor')
        }
        return this.$t('Panels.MmuPanel.StartPrintDialogMmu.MultiColor', { numTools: numTools })
    }

    get classSecondDivider() {
        const classes = ['mt-4']
        classes.push(this.moonrakerComponents.includes('timelapse') ? 'mb-2' : 'mb-0')
        return classes
    }
}
</script>

<style scoped></style>
