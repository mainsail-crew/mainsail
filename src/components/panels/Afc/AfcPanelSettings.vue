<template>
    <v-menu :offset-y="true" :close-on-content-click="false" :title="$t('Panels.AfcPanel.Settings')" left>
        <template #activator="{ on, attrs }">
            <v-btn icon tile v-bind="attrs" v-on="on">
                <v-icon small>{{ mdiCog }}</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showFilamentName"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowFilamentName')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showLaneInfinite"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowLaneInfinite')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showUnitIcons"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowUnitIcons')" />
            </v-list-item>
            <v-list-item class="minHeight36">
                <v-checkbox
                    v-model="showToolChangeCount"
                    class="mt-0"
                    hide-details
                    :label="$t('Panels.AfcPanel.ShowToolChangeCount')" />
            </v-list-item>
            <v-divider />
            <afc-panel-settings-extruder v-for="extruder in afcExtruders" :key="extruder" :name="extruder" />
            <afc-panel-settings-unit v-for="unit in afcUnits" :key="unit" :name="unit" />
        </v-list>
    </v-menu>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import AfcMixin from '@/components/mixins/afc'
import { mdiCog } from '@mdi/js'

@Component
export default class AfcPanelSettings extends Mixins(BaseMixin, AfcMixin) {
    mdiCog = mdiCog

    get showFilamentName(): boolean {
        return this.$store.state.gui.view.afc?.showFilamentName ?? true
    }

    set showFilamentName(value: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showFilamentName', value })
    }

    get showLaneInfinite(): boolean {
        return this.$store.state.gui.view.afc?.showLaneInfinite ?? true
    }

    set showLaneInfinite(value: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showLaneInfinite', value })
    }

    get showToolChangeCount(): boolean {
        return this.$store.state.gui.view.afc?.showToolChangeCount ?? true
    }

    set showToolChangeCount(value: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showToolChangeCount', value })
    }

    get showUnitIcons(): boolean {
        return this.$store.state.gui.view.afc?.showUnitIcons ?? true
    }

    set showUnitIcons(value: boolean) {
        this.$store.dispatch('gui/saveSetting', { name: 'view.afc.showUnitIcons', value })
    }
}
</script>
