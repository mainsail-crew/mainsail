<template>
    <v-card-text class="py-3 bt-1">
        <settings-row :title="$t('Dialogs.StartPrint.Timelapse')" :dense="true">
            <v-switch v-model="timelapseEnabled" hide-details class="mt-0" />
        </settings-row>
    </v-card-text>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component
export default class StartPrintDialogTimelapse extends Mixins(BaseMixin) {
    get timelapseEnabled() {
        return this.$store.state.server.timelapse?.settings?.enabled ?? false
    }

    set timelapseEnabled(newVal) {
        this.$socket.emit(
            'machine.timelapse.post_settings',
            { enabled: newVal },
            { action: 'server/timelapse/initSettings' }
        )
    }
}
</script>
