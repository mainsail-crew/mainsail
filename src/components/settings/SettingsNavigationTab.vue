<template>
    <div>
        <v-card-text>
            <h3 class="text-h5 mb-3">{{ $t('Settings.NavigationTab.Navigation') }}</h3>
            <draggable
                v-model="sortableNaviPoints"
                handle=".handle"
                ghost-class="ghost"
                group="navigation-points"
                :force-fallback="true">
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

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useNavigation } from '@/composables/useNavigation'
import { useTheme } from '@/composables/useTheme'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import draggable from 'vuedraggable'
import SettingsNavigationTabItem from '@/components/settings/SettingsNavigationTabItem.vue'
import type { NaviPoint } from '@/components/mixins/navigation'

const store = useStore()
const { naviPoints } = useNavigation()
const { draggableBgStyle } = useTheme()

const sortableNaviPoints = computed({
    get: () => naviPoints.value.filter((naviPoint) => naviPoint.position > 0),
    set: (newVal: NaviPoint[]) => {
        newVal.forEach((naviPoint, index) => {
            store.dispatch('gui/navigation/updatePos', {
                type: naviPoint.type,
                title: naviPoint.orgTitle ?? naviPoint.title,
                visible: naviPoint.visible,
                position: index + 1,
            })
        })

        store.dispatch('gui/navigation/upload')
    },
})
</script>
