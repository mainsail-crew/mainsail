<template>
    <div>
        <panel :icon="mdiAdjust" :title="title" card-class="spoolman-panel" :collapsible="true">
            <template #buttons>
                <v-btn icon @click="showChangeSpoolDialog = true">
                    <v-icon>{{ mdiSync }}</v-icon>
                </v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col class="pl-6 pt-6" style="max-width: 200px">
                        <spool-icon />
                    </v-col>
                    <v-col>bla</v-col>
                </v-row>
            </v-card-text>
        </panel>
        <spoolman-change-spool-dialog :show-dialog="showChangeSpoolDialog" @close="showChangeSpoolDialog = false" />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust, mdiSync } from '@mdi/js'
import SpoolmanChangeSpoolDialog from '@/components/panels/Spoolman/SpoolmanChangeSpoolDialog.vue'

@Component({
    components: { Panel, SpoolmanChangeSpoolDialog },
})
export default class SpoolmanPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust
    mdiSync = mdiSync

    showChangeSpoolDialog = false

    get health() {
        return this.$store.state.server.spoolman.health ?? ''
    }

    get title() {
        if (this.health === '') return 'Spoolman'

        return `Spoolman (${this.health})`
    }
}
</script>

<style scoped></style>
