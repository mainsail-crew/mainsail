<template>
    <v-card-text class="py-3 px-2 bt-1">
        <template v-if="isMultiTool">
            <start-print-dialog-spoolman-tool
                v-for="(tool, index) in toolIndices"
                :key="tool"
                :file="file"
                :tool-index="tool"
                :border-top="index > 0" />
        </template>
        <template v-else>
            <spoolman-panel-active-spool
                v-if="activeSpoolId !== null"
                :small="true"
                class="my-0"
                @change-spool="showChangeSpoolDialog = true" />
            <v-alert v-for="alert in alerts" :key="alert.text" text :color="alert.color" class="mx-3">
                {{ alert.text }}
            </v-alert>
            <div class="text-center">
                <v-btn color="primary" small class="mx-auto" @click="showChangeSpoolDialog = true">
                    {{ buttonText }}
                </v-btn>
            </div>
            <spoolman-change-spool-dialog v-model="showChangeSpoolDialog" />
        </template>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SpoolmanPanelActiveSpool from '@/components/panels/Spoolman/SpoolmanPanelActiveSpool.vue'
import StartPrintDialogSpoolmanTool from '@/components/dialogs/StartPrintDialogSpoolmanTool.vue'
import SpoolmanChangeSpoolDialog from '@/components/dialogs/SpoolmanChangeSpoolDialog.vue'
import { FileStateGcodefile } from '@/store/files/types'
import { convertStringToArray } from '@/plugins/helpers'

@Component({
    components: { SpoolmanPanelActiveSpool, StartPrintDialogSpoolmanTool, SpoolmanChangeSpoolDialog },
})
export default class StartPrintDialogSpoolman extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly file!: FileStateGcodefile

    showChangeSpoolDialog = false

    get toolSpools(): Record<number, number | null> {
        return this.$store.state.server.spoolman?.tool_spools ?? {}
    }

    get toolIndices(): number[] {
        // Build a canonical tool list from all available sources
        const indices = new Set<number>()

        // From Moonraker tool_spool_map
        for (const k of Object.keys(this.toolSpools)) {
            const n = Number.parseInt(k, 10)
            if (!Number.isNaN(n)) indices.add(n)
        }

        // From file metadata (filament_weights array length implies tool count)
        const weights = this.file.filament_weights ?? []
        for (let i = 0; i < weights.length; i++) indices.add(i)

        const types = convertStringToArray(this.file.filament_type ?? '')
        for (let i = 0; i < types.length; i++) indices.add(i)

        return Array.from(indices).sort((a, b) => a - b)
    }

    get isMultiTool(): boolean {
        return this.toolIndices.length > 1
    }

    get activeSpoolId() {
        let spoolId = this.$store.state.server.spoolman?.active_spool_id ?? null
        if (spoolId === 0) spoolId = null

        return spoolId
    }

    get activeSpool() {
        return this.$store.state.server.spoolman?.active_spool ?? null
    }

    get buttonText() {
        if (this.activeSpoolId === null) return this.$t('Panels.SpoolmanPanel.SelectSpool') as string

        return this.$t('Panels.SpoolmanPanel.ChangeSpool') as string
    }

    get alerts() {
        const alerts = []

        if (this.activeSpoolId === null) {
            alerts.push({
                text: this.$t('Panels.SpoolmanPanel.NoSpoolSelected'),
                color: 'orange',
            })

            // No need to check for filament type mismatch if no spool is selected
            return alerts
        }

        const gcodeFilamentType = convertStringToArray(this.file.filament_type ?? '')[0] ?? ''
        if (
            gcodeFilamentType !== '' &&
            this.activeSpool?.filament?.material?.toLowerCase() !== gcodeFilamentType.toLowerCase()
        ) {
            alerts.push({
                text: this.$t('Panels.SpoolmanPanel.FilamentTypeMismatch', {
                    fileType: gcodeFilamentType,
                    spoolType: this.activeSpool?.filament?.material,
                }),
                color: 'warning',
            })
        }

        const fileWeight = Math.round(this.file.filament_weight_total ?? 0)
        const spoolWeight = Math.round(this.activeSpool?.remaining_weight ?? 0)
        if (spoolWeight < fileWeight) {
            alerts.push({
                text: this.$t('Panels.SpoolmanPanel.TooLessFilament', {
                    fileWeight,
                    spoolWeight,
                }),
                color: 'warning',
            })
        }

        return alerts
    }
}
</script>
