<template>
    <div>
        <panel :icon="mdiAdjust" :title="title" card-class="spoolman-panel">bla</panel>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import { mdiAdjust } from '@mdi/js'
@Component({
    components: { Panel },
})
export default class SpoolmanPanel extends Mixins(BaseMixin) {
    mdiAdjust = mdiAdjust

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
