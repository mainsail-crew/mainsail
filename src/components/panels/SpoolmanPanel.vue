<template>
    <div>
        <panel :icon="mdiAdjust" :title="title" card-class="spoolman-panel" :collapsible="true">
            <template #buttons>
                <template v-if="active_spool === null">
                    <v-btn icon tile :title="$t('Panels.Spoolman.SelectSpool')" @click="showChangeSpoolDialog = true">
                        <v-icon>{{ mdiSwapVertical }}</v-icon>
                    </v-btn>
                </template>
                <template v-else>
                    <v-btn icon tile :title="$t('Panels.Spoolman.ChangeSpool')" @click="showChangeSpoolDialog = true">
                        <v-icon>{{ mdiSwapVertical }}</v-icon>
                    </v-btn>
                    <v-btn icon tile :title="$t('Panels.Spoolman.EjectSpool')" @click="showEjectSpoolDialog = true">
                        <v-icon>{{ mdiEject }}</v-icon>
                    </v-btn>
                </template>
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
                    <div class="text-overline mb-1">#{{ id }} | {{ vendor }}</div>
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
        <spoolman-eject-spool-dialog :show-dialog="showEjectSpoolDialog" @close="showEjectSpoolDialog = false" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiEject, mdiSwapVertical } from '@mdi/js'
import SpoolmanChangeSpoolDialog from '@/components/panels/Spoolman/SpoolmanChangeSpoolDialog.vue'
import SpoolmanEjectSpoolDialog from '@/components/panels/Spoolman/SpoolmanEjectSpoolDialog.vue'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component({
    components: { Panel, SpoolmanChangeSpoolDialog, SpoolmanEjectSpoolDialog },
})
export default class SpoolmanPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiEject = mdiEject
    mdiSwapVertical = mdiSwapVertical

    showChangeSpoolDialog = false
    showEjectSpoolDialog = false

    get health() {
        return this.$store.state.server.spoolman.health ?? ''
    }

    get title() {
        if (this.health === '' || this.health === 'healthy') return 'Spoolman'

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

    get id() {
        return this.active_spool?.id ?? 'XX'
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

        return material
    }

    get weightOutput() {
        const remaining = this.active_spool?.remaining_weight ?? null
        let total = this.active_spool?.filament.weight ?? null
        let unit = 'g'

        if (remaining === null || total === null) return null
        let totalRound = Math.floor(total / 1000)

        if (total >= 1000) {
            if (totalRound !== total / 1000) {
                totalRound = Math.round(total / 100) / 10
            }

            return `${remaining}g / ${totalRound}kg`
        }

        return `${remaining} / ${total}${unit}`
    }

    get lengthOutput() {
        let remaining = this.active_spool?.remaining_length ?? null

        if (remaining === null) return null
        remaining = Math.round(remaining / 1000)

        return `${remaining}m`
    }

    get subtitle() {
        return [this.materialOutput, this.weightOutput, this.lengthOutput].filter((v) => v !== null).join(' | ')
    }
}
</script>

<style scoped></style>
