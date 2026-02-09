<template>
    <v-tabs v-model="activeTab" show-arrows background-color="transparent" class="temperature-panel-tabs" height="36">
        <v-tab v-if="showAllTab" :key="'all'" class="text-none">
            {{ $t('Panels.TemperaturePanel.All') }}
        </v-tab>
        <v-tab v-for="group in sortedGroups" :key="group.id" class="text-none">
            {{ group.name }}
        </v-tab>
    </v-tabs>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { GuiTempgroup } from '@/store/gui/tempgroups/types'

@Component
export default class TemperaturePanelTabs extends Mixins(BaseMixin) {
    get activeTab(): number {
        const activeGroupId = this.$store.state.gui.tempgroups.activeGroupId

        if (this.showAllTab && !activeGroupId) {
            return 0
        }

        const groupIndex = this.sortedGroups.findIndex((g) => g.id === activeGroupId)

        if (this.showAllTab) {
            return groupIndex !== -1 ? groupIndex + 1 : 0
        }

        return groupIndex !== -1 ? groupIndex : 0
    }

    set activeTab(index: number) {
        if (this.showAllTab && index === 0) {
            this.$store.dispatch('gui/tempgroups/setActiveGroup', null)
            return
        }

        const groupIndex = this.showAllTab ? index - 1 : index

        const group = this.sortedGroups[groupIndex]
        if (group) {
            this.$store.dispatch('gui/tempgroups/setActiveGroup', group.id)
        }
    }

    get showAllTab(): boolean {
        return this.$store.state.gui.tempgroups.showAllTab ?? true
    }

    get sortedGroups(): GuiTempgroup[] {
        return this.$store.getters['gui/tempgroups/getSortedGroups'] ?? []
    }
}
</script>

<style scoped>
.temperature-panel-tabs {
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.theme--light .temperature-panel-tabs {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.temperature-panel-tabs ::v-deep .v-slide-group__prev,
.temperature-panel-tabs ::v-deep .v-slide-group__next {
    min-width: 32px;
}
</style>
