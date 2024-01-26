<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ $t('Settings.NavigationTab.Navigation') }}</h3>
            <draggable v-model="sortableNaviPoints" handle=".handle" ghost-class="ghost" group="navigation-points">
                <settings-navigation-tab-item
                    v-for="(naviPoint, index) in sortableNaviPoints"
                    :key="index"
                    class="my-2 mx-0"
                    :style="draggableBgStyle"
                    :navi-point="naviPoint" />
            </draggable>
        </v-card-text>
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import NavigationMixin, { NaviPoint } from '@/components/mixins/navigation'
import ThemeMixin from '@/components/mixins/theme'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import draggable from 'vuedraggable'
import SettingsNavigationTabItem from '@/components/settings/SettingsNavigationTabItem.vue'

@Component({
    components: { SettingsNavigationTabItem, SettingsRow, draggable },
})
export default class SettingsNavigationTab extends Mixins(NavigationMixin, BaseMixin, ThemeMixin) {
    get sortableNaviPoints() {
        return this.naviPoints.filter((naviPoint) => naviPoint.position > 0)
    }

    set sortableNaviPoints(newVal: NaviPoint[]) {
        // update store with new positions
        newVal.forEach((naviPoint, index) => {
            this.$store.dispatch('gui/navigation/updatePos', {
                type: naviPoint.type,
                title: naviPoint.orgTitle ?? naviPoint.title,
                visible: naviPoint.visible,
                position: index + 1,
            })
        })

        // upload to moonraker db
        this.$store.dispatch('gui/navigation/upload')
    }
}
</script>
