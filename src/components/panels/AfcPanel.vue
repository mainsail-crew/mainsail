<template>
    <panel
        v-if="klipperReadyForGui"
        :title="$t('Panels.AfcPanel.Headline')"
        :icon="afcIconLogo"
        :collapsible="true"
        card-class="afc-control-panel">
        <template #buttons>
            <afc-panel-buttons />
            <afc-panel-settings />
        </template>
        <v-card-text class="pt-1">
            <afc-panel-message />
            <afc-panel-bypass />
            <afc-panel-extruder v-for="extruder in filteredExtruders" :key="extruder" :name="extruder" class="mt-3" />
            <afc-panel-unit v-for="unit in filteredUnits" :key="unit" :name="unit" class="mt-3" />
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

    get filteredExtruders() {
        return this.afcExtruders.filter((extruder) => !this.afcHiddenExtruders.includes(extruder))
    }

    get filteredUnits() {
        return this.afcUnits.filter((unit) => !this.afcHiddenUnits.includes(unit))
    }
}
</script>
