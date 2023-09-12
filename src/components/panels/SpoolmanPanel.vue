<template>
    <div>
        <panel :icon="mdiAdjust" :title="title" card-class="spoolman-panel" :collapsible="true">
            <template #buttons>
                <v-menu left offset-y :close-on-content-click="true" class="pa-0">
                    <template #activator="{ on, attrs }">
                        <v-btn icon tile v-bind="attrs" :disabled="['printing'].includes(printer_state)" v-on="on">
                            <v-icon>{{ mdiDotsVertical }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense>
                        <template v-if="active_spool === null">
                            <v-list-item>
                                <v-btn small style="width: 100%" @click="showChangeSpoolDialog = true">
                                    <v-icon left small>{{ mdiAdjust }}</v-icon>
                                    {{ $t('Panels.Spoolman.SelectSpool') }}
                                </v-btn>
                            </v-list-item>
                        </template>
                        <template v-else>
                            <v-list-item>
                                <v-btn small style="width: 100%" @click="showChangeSpoolDialog = true">
                                    <v-icon left small>{{ mdiSync }}</v-icon>
                                    {{ $t('Panels.Spoolman.ChangeSpool') }}
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small style="width: 100%" @click="removeSpool">
                                    <v-icon left small>{{ mdiMinusCircleOutline }}</v-icon>
                                    {{ $t('Panels.Spoolman.RemoveSpool') }}
                                </v-btn>
                            </v-list-item>
                        </template>
                    </v-list>
                </v-menu>
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
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiDotsVertical, mdiMinusCircleOutline, mdiSync } from '@mdi/js'
import SpoolmanChangeSpoolDialog from '@/components/panels/Spoolman/SpoolmanChangeSpoolDialog.vue'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'

@Component({
    components: { Panel, SpoolmanChangeSpoolDialog },
})
export default class SpoolmanPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiDotsVertical = mdiDotsVertical
    mdiMinusCircleOutline = mdiMinusCircleOutline
    mdiSync = mdiSync

    showChangeSpoolDialog = false

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

    removeSpool() {
        this.$store.dispatch('server/spoolman/setActiveSpool', 0)
    }
}
</script>

<style scoped></style>
