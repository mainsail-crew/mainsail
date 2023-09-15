<template>
    <div>
        <panel :icon="mdiAdjust" :title="title" card-class="spoolman-panel" :collapsible="true">
            <template #buttons>
                <v-btn icon tile :title="changeSpoolTooltip" @click="showChangeSpoolDialog = true">
                    <v-icon>{{ mdiSwapVertical }}</v-icon>
                </v-btn>
                <v-menu :offset-y="true" :close-on-content-click="false" left>
                    <template #activator="{ on, attrs }">
                        <v-btn icon tile v-bind="attrs" v-on="on">
                            <v-icon>{{ mdiDotsVertical }}</v-icon>
                        </v-btn>
                    </template>
                    <v-list dense>
                        <v-list-item>
                            <v-btn small style="width: 100%" @click="showEjectSpoolDialog = true">
                                <v-icon left>{{ mdiEject }}</v-icon>
                                {{ $t('Panels.Spoolman.EjectSpool') }}
                            </v-btn>
                        </v-list-item>
                        <v-list-item>
                            <v-btn small style="width: 100%" @click="openSpoolManager">
                                <v-icon left>{{ mdiOpenInNew }}</v-icon>
                                {{ $t('Panels.Spoolman.OpenSpoolManager') }}
                            </v-btn>
                        </v-list-item>
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
            <spoolman-panel-active-spool v-else />
        </panel>
        <spoolman-change-spool-dialog :show-dialog="showChangeSpoolDialog" @close="showChangeSpoolDialog = false" />
        <spoolman-eject-spool-dialog :show-dialog="showEjectSpoolDialog" @close="showEjectSpoolDialog = false" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiDotsVertical, mdiEject, mdiOpenInNew, mdiSwapVertical } from '@mdi/js'
import SpoolmanChangeSpoolDialog from '@/components/dialogs/SpoolmanChangeSpoolDialog.vue'
import SpoolmanEjectSpoolDialog from '@/components/dialogs/SpoolmanEjectSpoolDialog.vue'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import SpoolmanPanelActiveSpool from '@/components/panels/Spoolman/SpoolmanPanelActiveSpool.vue'

@Component({
    components: { SpoolmanPanelActiveSpool, Panel, SpoolmanChangeSpoolDialog, SpoolmanEjectSpoolDialog },
})
export default class SpoolmanPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiDotsVertical = mdiDotsVertical
    mdiEject = mdiEject
    mdiOpenInNew = mdiOpenInNew
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

    get changeSpoolTooltip(): string {
        if (this.active_spool === null) return this.$t('Panels.Spoolman.SelectSpool') as string

        return this.$t('Panels.Spoolman.ChangeSpool') as string
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
        let remaining = this.active_spool?.remaining_weight ?? null
        let total = this.active_spool?.filament.weight ?? null
        let unit = 'g'

        if (remaining === null || total === null) return null
        remaining = Math.round(remaining)
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

    get spoolManagerUrl() {
        return this.$store.state.server.config.config?.spoolman?.server ?? null
    }

    openSpoolManager() {
        window.open(this.spoolManagerUrl, '_blank')
    }
}
</script>

<style scoped></style>
