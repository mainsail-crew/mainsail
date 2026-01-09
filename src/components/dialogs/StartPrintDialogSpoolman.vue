<template>
    <v-card-text class="py-3 px-2 bt-1">
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
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SpoolmanPanelActiveSpool from '@/components/panels/Spoolman/SpoolmanPanelActiveSpool.vue'
import { FileStateGcodefile } from '@/store/files/types'
import { convertStringToArray } from '@/plugins/helpers'

@Component({
    components: { SpoolmanPanelActiveSpool },
})
export default class StartPrintDialogSpoolman extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly file!: FileStateGcodefile

    showChangeSpoolDialog = false

    get activeSpoolId() {
        let spoolId = this.$store.state.server.spoolman?.active_spool_id ?? null
        if (spoolId === 0) spoolId = null

        return spoolId
    }

    get activeSpool() {
        return this.$store.state.server.spoolman?.active_spool ?? null
    }

    get classSecondDivider() {
        const classes = ['mt-4']

        classes.push(this.moonrakerComponents.includes('timelapse') ? 'mb-2' : 'mb-0')

        return classes
    }

    get buttonText() {
        if (this.activeSpoolId === null) return this.$t('Panels.SpoolmanPanel.SelectSpool') as string

        return this.$t('Panels.SpoolmanPanel.ChangeSpool') as string
    }

    get alerts() {
        let alerts = []

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
