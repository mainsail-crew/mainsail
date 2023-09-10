<template>
    <div>
        <panel :icon="mdiAdjust" :title="title" card-class="spoolman-panel" :collapsible="true">
            <template #buttons>
                <v-btn icon @click="showChangeSpoolDialog = true">
                    <v-icon>{{ mdiSync }}</v-icon>
                </v-btn>
            </template>
            <v-card-text v-if="active_spool === null">
                <v-row>
                    <v-col class="text-center">
                        <p class="text--disabled">{{ $t('Panels.Spoolman.NoActiveSpool') }}</p>
                        <v-btn small color="primary" @click="showChangeSpoolDialog = true">
                            {{ $t('Panels.Spoolman.SelectSpool') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-list-item v-else three-line>
                <v-list-item-content>
                    <div class="text-overline mb-1">{{ vendor }}</div>
                    <v-list-item-title class="text-h5 mb-1">
                        {{ name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ subtitle }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-avatar tile size="80">
                    <spool-icon :color="color" />
                </v-list-item-avatar>
            </v-list-item>
        </panel>
        <spoolman-change-spool-dialog :show-dialog="showChangeSpoolDialog" @close="showChangeSpoolDialog = false" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiSync } from '@mdi/js'
import SpoolmanChangeSpoolDialog from '@/components/panels/Spoolman/SpoolmanChangeSpoolDialog.vue'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component({
    components: { Panel, SpoolmanChangeSpoolDialog },
})
export default class SpoolmanPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiSync = mdiSync

    showChangeSpoolDialog = false

    get health() {
        return this.$store.state.server.spoolman.health ?? ''
    }

    get title() {
        if (this.health === '') return 'Spoolman'

        return `Spoolman (${this.health})`
    }

    get active_spool(): ServerSpoolmanStateSpool | null {
        return this.$store.state.server.spoolman.active_spool ?? null
    }

    get color() {
        const color = this.active_spool?.filament.color_hex ?? null
        if (color === null) return '#000'

        return `#${color}`
    }

    get vendor() {
        return this.active_spool?.filament?.vendor?.name ?? 'Unknown'
    }

    get name() {
        return this.active_spool?.filament.name ?? 'Unknown'
    }

    get materialOutput() {
        const material = this.active_spool?.filament.material ?? null
        if (material === null) return null

        return this.$t('Panels.Spoolman.MaterialOutput', { material })
    }

    get weightOutput() {
        const remaining = this.active_spool?.remaining_weight ?? null
        const total = this.active_spool?.filament.weight ?? null

        if (remaining === null || total === null) return null

        return this.$t('Panels.Spoolman.WeightOutput', { remaining, total })
    }

    get firstUsedString() {
        const first_used = this.active_spool?.first_used ?? null
        if (first_used === null) return null

        const date = new Date(first_used)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff <= 1000 * 60 * 60 * 24) return this.$t('Panels.Spoolman.Today')
        if (diff <= 1000 * 60 * 60 * 24 * 2) return this.$t('Panels.Spoolman.Yesterday')
        if (diff <= 1000 * 60 * 60 * 24 * 14) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))

            return this.$t('Panels.Spoolman.DaysAgo', { days })
        }

        return date.toLocaleDateString()
    }

    get firstUsedOutput() {
        if (this.firstUsedString === null) return null

        return this.$t('Panels.Spoolman.FirstUsedOutput', { firstUsed: this.firstUsedString })
    }

    get subtitle() {
        return [this.materialOutput, this.weightOutput, this.firstUsedOutput].filter((v) => v !== null).join(', ')
    }
}
</script>

<style scoped></style>
