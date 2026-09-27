<template>
    <div>
        <panel
            v-if="isSupported || isRegistered"
            :title="$t('Machine.FirmwarePanel.FirmwareUpdates')"
            :icon="mdiChip"
            card-class="machine-firmware-panel"
            :collapsible="true">
            <template #buttons>
                <v-tooltip top>
                    <template #activator="{ on, attrs }">
                        <v-btn
                            icon
                            tile
                            color="primary"
                            :loading="isRefreshing"
                            :disabled="refreshDisabled"
                            v-bind="attrs"
                            @click="refresh"
                            v-on="on">
                            <v-icon>{{ mdiRefresh }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('Machine.FirmwarePanel.Refresh') }}</span>
                </v-tooltip>
            </template>
            <v-card-text class="px-0 py-0">
                <v-row v-if="!isSupported" class="my-0">
                    <v-col class="px-6">
                        <v-alert class="mb-0" text dense type="info" border="left">
                            {{ $t('Machine.FirmwarePanel.NotRunning') }}
                        </v-alert>
                    </v-col>
                </v-row>
                <v-row v-else-if="isLoading" class="my-0">
                    <v-col class="px-6">
                        <v-progress-circular indeterminate size="16" width="2" class="mr-2" />
                        {{ $t('Machine.FirmwarePanel.Loading') }}
                    </v-col>
                </v-row>
                <template v-else>
                    <v-row v-if="hasAlerts" class="my-0">
                        <v-col class="px-6 pb-0">
                            <v-alert v-if="statusError" text dense type="error" border="left">
                                {{ $t('Machine.FirmwarePanel.StatusError', { message: statusError }) }}
                            </v-alert>
                            <v-alert v-if="!isApiSupported" text dense type="warning" border="left">
                                {{ $t('Machine.FirmwarePanel.UnsupportedApi', { version: apiVersion }) }}
                            </v-alert>
                            <v-alert v-if="blocker" text dense type="warning" border="left">
                                {{ blocker.message }}
                                <template v-if="blocker.reason === 'restart_pending'">
                                    <br />
                                    {{ $t('Machine.FirmwarePanel.RestartPendingHint') }}
                                </template>
                            </v-alert>
                            <v-alert v-if="lastRunFailed" text dense type="error" border="left">
                                {{ lastMessage }}
                            </v-alert>
                        </v-col>
                    </v-row>
                    <template v-if="host">
                        <firmware-panel-entry-host :host="host" />
                    </template>
                    <template v-for="mcu in mcus">
                        <v-divider :key="'divider_' + mcu.name" class="my-0" />
                        <firmware-panel-entry
                            :key="mcu.name"
                            :mcu="mcu"
                            :target-version="host ? (host.software_version ?? null) : null"
                            :disabled="updateDisabled" />
                    </template>
                    <template v-if="updatableMcus.length">
                        <v-divider class="mb-0 mt-2 border-top-2" />
                        <firmware-panel-entry-all :mcus="updatableMcus" :disabled="updateDisabled" />
                    </template>
                </template>
            </v-card-text>
        </panel>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import FirmwarePanelEntryHost from '@/components/panels/Machine/FirmwarePanel/FirmwareEntryHost.vue'
import FirmwarePanelEntry from '@/components/panels/Machine/FirmwarePanel/FirmwareEntry.vue'
import FirmwarePanelEntryAll from '@/components/panels/Machine/FirmwarePanel/FirmwareEntryAll.vue'
import { AldisBlocker, AldisHost, AldisMcu } from '@/store/server/firmware/types'
import { mdiChip, mdiRefresh } from '@mdi/js'

@Component({
    components: { Panel, FirmwarePanelEntryHost, FirmwarePanelEntry, FirmwarePanelEntryAll },
})
export default class FirmwarePanel extends Mixins(BaseMixin) {
    mdiChip = mdiChip
    mdiRefresh = mdiRefresh

    get isSupported(): boolean {
        return this.$store.getters['server/firmware/isSupported']
    }

    get isRegistered(): boolean {
        return this.$store.getters['server/firmware/isRegistered']
    }

    get isLoading(): boolean {
        return this.$store.getters['server/firmware/isLoading']
    }

    get isRefreshing(): boolean {
        return this.$store.getters['server/firmware/isRefreshing']
    }

    get isApiSupported(): boolean {
        return this.$store.getters['server/firmware/isApiSupported']
    }

    get apiVersion(): number | null {
        return this.$store.state.server.firmware?.status?.api_version ?? null
    }

    get statusError(): string | null {
        return this.$store.getters['server/firmware/getStatusError']
    }

    get blocker(): AldisBlocker | null {
        return this.$store.getters['server/firmware/getBlocker']
    }

    get host(): AldisHost | null {
        return this.$store.getters['server/firmware/getHost']
    }

    get mcus(): AldisMcu[] {
        return this.$store.getters['server/firmware/getMcus']
    }

    get updatableMcus(): string[] {
        return this.$store.getters['server/firmware/getUpdatableMcus']
    }

    get busy(): boolean {
        return this.$store.state.server.firmware?.busy ?? false
    }

    get lastRunFailed(): boolean {
        return this.$store.state.server.firmware?.lastResult?.outcome === 'failed'
    }

    get lastMessage(): string | null {
        return this.$store.state.server.firmware?.lastMessage ?? null
    }

    get hasAlerts() {
        return !!this.statusError || !this.isApiSupported || this.blocker !== null || this.lastRunFailed
    }

    // The agent's printing blocker is authoritative; printer_state only covers the gap until the next status.
    get updateDisabled() {
        return (
            this.isLoading ||
            this.blocker !== null ||
            !this.isApiSupported ||
            this.isRefreshing ||
            this.busy ||
            ['printing', 'paused'].includes(this.printer_state)
        )
    }

    get refreshDisabled() {
        return this.isRefreshing || this.busy
    }

    refresh() {
        if (!this.isSupported) {
            this.$store.dispatch('server/refreshAgents')
            return
        }

        this.$store.dispatch('server/firmware/refresh')
    }
}
</script>
