<template>
    <v-list-item>
        <v-row>
            <v-col class="col-auto px-0">
                <v-icon class="handle pr-2">{{ mdiDragVertical }}</v-icon>
                <v-icon>{{ icon }}</v-icon>
            </v-col>
            <v-col class="pr-0 text-truncate">
                {{ panelname }}
            </v-col>
            <v-col class="col-auto pl-2">
                <v-icon
                    :color="checkboxColor"
                    @click.stop="$emit('change-visible', name, !visible)"
                    v-html="checkboxIcon" />
            </v-col>
        </v-row>
    </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiDragVertical, mdiInformation } from '@mdi/js'
import { useDashboard } from '@/composables/useDashboard'

const props = defineProps({
    name: { type: String, required: true },
    visible: { type: Boolean, required: true },
})

defineEmits<{
    (e: 'change-visible', name: string, visible: boolean): void
}>()

const { getPanelName, convertPanelnameToIcon } = useDashboard()

const panelname = computed(() => getPanelName(props.name))
const icon = computed(() => convertPanelnameToIcon(props.name))

const checkboxColor = computed(() => props.visible ? 'primary' : 'grey lighten-1')
const checkboxIcon = computed(() => props.visible ? mdiCheckboxMarked : mdiCheckboxBlankOutline)
</script>

<style scoped>
.handle {
    cursor: move;
}
</style>
