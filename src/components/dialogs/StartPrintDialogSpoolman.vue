<template>
    <div>
        <v-divider class="mt-3 mb-0" />
        <v-card-text class="py-0 px-2">
            <spoolman-panel-active-spool v-if="activeSpoolId !== null" :small="true" class="my-0" />
            <v-alert v-for="alert in alerts" :key="alert.text" text :color="alert.warning" class="mt-4 mx-3">
                {{ alert.text }}
            </v-alert>
        </v-card-text>
        <v-divider class="mt-0 mb-0" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SpoolmanPanelActiveSpool from '@/components/panels/Spoolman/SpoolmanPanelActiveSpool.vue'
import { FileStateGcodefile } from '@/store/files/types'

@Component({
    components: { SpoolmanPanelActiveSpool },
})
export default class StartPrintDialogSpoolman extends Mixins(BaseMixin) {
    @Prop({ required: true }) readonly file!: FileStateGcodefile

    get activeSpoolId() {
        return this.$store.state.server.spoolman?.active_spool_id ?? null
    }

    get activeSpool() {
        return this.$store.state.server.spoolman?.active_spool ?? null
    }

    get alerts() {
        let alerts = []

        if (this.activeSpoolId === null) {
            alerts.push({
                text: this.$t('Dialogs.StartPrint.NoSpoolSelected'),
                color: 'warning',
            })
        }

        const gcodeFilamentType = (this.file.filament_type ?? '').toLowerCase()
        if (
            this.activeSpoolId !== null &&
            gcodeFilamentType !== '' &&
            this.activeSpool?.filament?.material?.toLowerCase() !== gcodeFilamentType
        ) {
            alerts.push({
                text: this.$t('Dialogs.StartPrint.FilamentTypeMismatch'),
                color: 'warning',
            })
        }

        return alerts
    }
}
</script>
