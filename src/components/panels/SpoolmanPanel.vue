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
                                {{ $t('Panels.SpoolmanPanel.EjectSpool') }}
                            </v-btn>
                        </v-list-item>
                        <v-list-item>
                            <v-btn small style="width: 100%" @click="openSpoolManager">
                                <v-icon left>{{ mdiOpenInNew }}</v-icon>
                                {{ $t('Panels.SpoolmanPanel.OpenSpoolManager') }}
                            </v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
            <v-card-text v-if="active_spool === null">
                <v-row>
                    <v-col class="text-center">
                        <p class="text--disabled">{{ $t('Panels.SpoolmanPanel.NoActiveSpool') }}</p>
                        <v-btn small color="primary" @click="showChangeSpoolDialog = true">
                            {{ $t('Panels.SpoolmanPanel.SelectSpool') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <spoolman-panel-active-spool v-else @change-spool="showChangeSpoolDialog = true" />
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
        const headline = this.$t('Panels.SpoolmanPanel.Headline') as string

        if (this.health === '' || this.health === 'healthy') return headline

        return `${headline} (${this.health})`
    }

    get changeSpoolTooltip(): string {
        if (this.active_spool === null) return this.$t('Panels.SpoolmanPanel.SelectSpool') as string

        return this.$t('Panels.SpoolmanPanel.ChangeSpool') as string
    }

    get active_spool(): ServerSpoolmanStateSpool | null {
        return this.$store.state.server.spoolman.active_spool ?? null
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
