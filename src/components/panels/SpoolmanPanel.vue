<template>
    <panel :icon="mdiAdjust" :title="title" card-class="spoolman-panel" :collapsible="true">
        <template #buttons>
            <spoolman-tools-dropdown v-if="toolIndices.length > 0" :tools="toolIndices" />
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
                    <v-list-item v-if="toolIndices.length === 0">
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
        <!-- Multi-tool: show all tool spools -->
        <template v-if="toolIndices.length > 0">
            <v-list dense class="py-0">
                <v-list-item v-for="tool in toolIndices" :key="tool" class="px-4">
                    <v-list-item-avatar :size="32" class="mr-3 my-1">
                        <spool-icon v-if="getToolSpool(tool)" :color="'#' + (getToolSpool(tool).filament?.color_hex ?? '000000')" />
                        <v-icon v-else color="grey lighten-1">{{ mdiAdjust }}</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content class="py-1">
                        <v-list-item-title class="text-subtitle-2">
                            <strong>T{{ tool }}</strong>
                            <span v-if="getToolSpool(tool)" class="ml-2">
                                {{ getToolSpool(tool).filament?.name ?? $t('Panels.SpoolmanPanel.UnknownFilament') }}
                            </span>
                            <span v-else class="ml-2 text--disabled font-italic">
                                {{ $t('Panels.SpoolmanPanel.NoSpool') }}
                            </span>
                        </v-list-item-title>
                        <v-list-item-subtitle v-if="getToolSpool(tool)">
                            {{ getToolSpool(tool).filament?.material ?? '' }}
                            | {{ $t('Panels.SpoolmanPanel.RemainingWeight', { weight: Math.round(getToolSpool(tool).remaining_weight ?? 0) }) }}
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </template>
        <!-- Single tool: legacy view -->
        <template v-else>
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
        </template>
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
import SpoolmanToolsDropdown from '@/components/panels/Spoolman/SpoolmanToolsDropdown.vue'
import SpoolIcon from '@/components/ui/SpoolIcon.vue'

@Component({
    components: { ConfirmationDialog, SpoolmanPanelActiveSpool, SpoolmanToolsDropdown, SpoolIcon, Panel, SpoolmanChangeSpoolDialog },
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

    get toolIndices(): number[] {
        const indices = new Set<number>()

        // Add tools from Moonraker tool_spools map
        const toolSpools = this.$store.state.server.spoolman.tool_spools ?? {}
        for (const k of Object.keys(toolSpools)) {
            indices.add(parseInt(k))
        }

        // Add tools from toolchanger if available
        const toolchanger = this.$store.state.printer?.toolchanger ?? null
        if (toolchanger?.tool_numbers?.length > 0) {
            for (const n of toolchanger.tool_numbers) {
                indices.add(n)
            }
        }

        if (indices.size > 0) {
            return [...indices].sort((a, b) => a - b)
        }

        // Fall back to legacy gcode_macro detection
        const macroTools = Object.keys(this.$store.state.printer)
            .filter((key) => /^gcode_macro T\d+$/i.test(key.toLowerCase()))
            .filter((key) => {
                const object = this.$store.state.printer[key] ?? {}
                return Object.keys(object).some((k) => k.toLowerCase() === 'spool_id')
            })
            .map((key) => {
                const match = key.match(/T(\d+)/i)
                return match ? parseInt(match[1]) : 0
            })
            .sort((a, b) => a - b)

        return macroTools
    }

    getToolSpool(tool: number): ServerSpoolmanStateSpool | null {
        return this.$store.state.server.spoolman.tool_spool_details?.[tool] ?? null
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
