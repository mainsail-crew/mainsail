<template>
    <panel :icon="mdiAdjust" :title="title" card-class="spoolman-panel" :collapsible="true">
        <template #buttons>
            <spoolman-tools-dropdown v-if="toolsWithSpoolId.length > 0" :tools="toolsWithSpoolId" />
            <v-btn v-else icon tile :title="changeSpoolTooltip" @click="showChangeSpoolDialog = true">
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
                        <v-btn small class="w-100" @click="showEjectSpoolDialog = true">
                            <v-icon left>{{ mdiEject }}</v-icon>
                            {{ $t('Panels.SpoolmanPanel.EjectSpool') }}
                        </v-btn>
                    </v-list-item>
                    <v-list-item v-if="spoolManagerUrl">
                        <v-btn small class="w-100" @click="openSpoolManager">
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
        <spoolman-change-spool-dialog v-model="showChangeSpoolDialog" />
        <confirmation-dialog
            v-model="showEjectSpoolDialog"
            :title="$t('Panels.SpoolmanPanel.EjectSpool')"
            :text="$t('Panels.SpoolmanPanel.EjectSpoolQuestion')"
            :action-button-text="$t('Panels.SpoolmanPanel.EjectSpool')"
            action-button-color="primary"
            :icon="mdiEject"
            @action="ejectSpool" />
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiDotsVertical, mdiEject, mdiOpenInNew, mdiSwapVertical } from '@mdi/js'
import SpoolmanChangeSpoolDialog from '@/components/dialogs/SpoolmanChangeSpoolDialog.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import SpoolmanPanelActiveSpool from '@/components/panels/Spoolman/SpoolmanPanelActiveSpool.vue'

@Component({
    components: { ConfirmationDialog, SpoolmanPanelActiveSpool, Panel, SpoolmanChangeSpoolDialog },
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

    get toolsWithSpoolId() {
        return Object.keys(this.$store.state.printer)
            .filter((key) => /^gcode_macro T\d+$/i.test(key.toLowerCase()))
            .filter((keys) => {
                const object = this.$store.state.printer[keys] ?? {}

                return Object.keys(object).some((key) => key.toLowerCase() === 'spool_id')
            })
    }

    openSpoolManager() {
        window.open(this.spoolManagerUrl, '_blank')
    }

    ejectSpool() {
        this.$store.dispatch('server/spoolman/setActiveSpool', null)
    }
}
</script>

<style scoped></style>
