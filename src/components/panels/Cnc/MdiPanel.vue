<template>
    <panel v-if="klipperReadyForGui" :icon="mdiConsole" title="MDI" :collapsible="true" card-class="mdi-panel">
        <v-container class="py-2">
            <!-- TODO: implement MDI panel for manual G-code entry and execution -->
            <p>This is the MDI Panel placeholder.</p>
        </v-container>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import Panel from '@/components/ui/Panel.vue'
import BaseMixin from '@/components/mixins/base'
import ControlMixin from '@/components/mixins/control'
import { mdiConsole } from '@mdi/js'

@Component({
    components: {
        Panel,
    },
})
export default class MdiPanel extends Mixins(BaseMixin, ControlMixin) {
    mdiConsole = mdiConsole
}
</script>

<style scoped>
/* Add any specific styles for the MDI Panel here */
</style>
