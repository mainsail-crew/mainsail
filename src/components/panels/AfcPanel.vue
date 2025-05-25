<template>
    <panel :title="$t('Panels.AfcPanel.Headline')" :collapsible="true" card-class="afc-control-panel">
        <template #icon><afc-logo class="panel-icon mr-2 w-24 h-24" /></template>
        <v-card-text>
            <afc-panel-extruder
                v-for="(extruder, index) in extruders"
                :key="extruder"
                :name="extruder"
                :class="{ 'mt-3': index > 0 }" />
        </v-card-text>
    </panel>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcLogo from '@/components/ui/afc/AfcLogo.vue'
import AfcMixin from '@/components/mixins/afc'

@Component({
    components: { AfcLogo },
})
export default class AfcPanel extends Mixins(BaseMixin, AfcMixin) {
    get extruders(): string[] {
        return this.afc.extruders ?? []
    }
}
</script>

<style scoped>
.panel-icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
}
</style>
