<template>
    <div>
        <v-divider class="mt-3 mb-0" />
        <v-card-text class="py-0 px-2">
            <spoolman-panel-active-spool v-if="activeSpool !== null" :small="true" class="my-0" />
            <v-alert v-else text color="warning" class="mt-4 mx-3">
                {{ $t('Dialogs.StartPrint.NoSpoolSelected') }}
            </v-alert>
        </v-card-text>
        <v-divider class="mt-0 mb-0" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import SpoolmanPanelActiveSpool from '@/components/panels/Spoolman/SpoolmanPanelActiveSpool.vue'

@Component({
    components: { SpoolmanPanelActiveSpool },
})
export default class StartPrintDialogSpoolman extends Mixins(BaseMixin) {
    get activeSpool() {
        return null

        return this.$store.state.server.spoolman?.active_spool_id ?? null
    }
}
</script>
