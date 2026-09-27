<template>
    <v-row class="py-2">
        <v-col class="pl-6">
            <strong>{{ $t('Machine.FirmwarePanel.KlipperService') }}</strong>
            <br />
            <span>{{ versionOutput }}</span>
            <br />
            <span class="text--disabled text-caption">{{ $t('Machine.FirmwarePanel.KlipperServiceHint') }}</span>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { AldisHost } from '@/store/server/firmware/types'

@Component
export default class FirmwarePanelEntryHost extends Mixins(BaseMixin) {
    @Prop({ type: Object, required: true }) readonly host!: AldisHost

    get versionOutput() {
        if (this.host.software_version) return this.host.software_version

        return this.host.klippy_message
            ? `${this.host.klippy_state}: ${this.host.klippy_message}`
            : this.host.klippy_state
    }
}
</script>
