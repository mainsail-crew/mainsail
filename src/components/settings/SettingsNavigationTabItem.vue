<template>
    <v-row class="my-2 mx-0" :style="draggableBgStyle">
        <v-col class="v-col-auto pr-0 d-flex py-2">
            <v-icon class="handle">{{ mdiDragVertical }}</v-icon>
        </v-col>
        <v-col class="py-2">
            <settings-row :title="title" :sub-title="subtitle" :dynamic-slot-width="true">
                <v-icon :color="checkboxColor" @click="changeVisibility" v-html="checkboxIcon" />
            </settings-row>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useNavigation } from '@/composables/useNavigation'
import { useTheme } from '@/composables/useTheme'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import draggable from 'vuedraggable'
import { mdiDragVertical, mdiCheckboxMarked, mdiCheckboxBlankOutline } from '@mdi/js'
import type { NaviPoint } from '@/composables/useNavigation'

const props = defineProps<{
    naviPoint: NaviPoint
}>()

const store = useStore()
const { draggableBgStyle } = useTheme()

const title = computed(() => props.naviPoint.title)

const subtitle = computed(() => {
    if (props.naviPoint.type === 'link') return `URL: ${props.naviPoint.href ?? 'Unknown'}`

    return undefined
})

const checkboxColor = computed(() => {
    if (props.naviPoint.visible) return 'primary'

    return '#bdbdbd'
})

const checkboxIcon = computed(() => {
    if (props.naviPoint.visible) return mdiCheckboxMarked

    return mdiCheckboxBlankOutline
})

function changeVisibility() {
    store.dispatch('gui/navigation/changeVisibility', props.naviPoint)
}
</script>
