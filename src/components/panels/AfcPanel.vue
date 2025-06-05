<template>
    <panel
        :title="$t('Panels.AfcPanel.Headline')"
        :icon="afcIconLogo"
        :collapsible="true"
        card-class="afc-control-panel">
        <v-card-text class="pt-1">
            <afc-panel-extruder v-for="extruder in extruders" :key="extruder" :name="extruder" class="mt-3" />
            <afc-panel-unit v-for="unit in units" :key="unit" :name="unit" class="mt-3" />
        </v-card-text>
    </panel>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { afcIconLogo } from '@/plugins/afcIcons'

@Component
export default class AfcPanel extends Mixins(BaseMixin, AfcMixin) {
    afcIconLogo = afcIconLogo

    get extruders(): string[] {
        return this.afc.extruders ?? []
    }

    get units(): string[] {
        return this.afc.units ?? []
    }
}
</script>
